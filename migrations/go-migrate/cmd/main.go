package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"path"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

const (
	CLONE_DIR      = "/tmp/mxfactorial"
	MIGRATIONS_DIR = CLONE_DIR + "/" + "migrations"
	REPO           = "https://github.com/systemaccounting/mxfactorial.git"
	TESTSEED       = "testseed"
)

var (
	pgHost                     = os.Getenv("PGHOST")
	pgPort                     = os.Getenv("PGPORT")
	pgUser                     = os.Getenv("PGUSER")
	pgPassword                 = os.Getenv("PGPASSWORD")
	pgDatabase                 = os.Getenv("PGDATABASE")
	connUrl            ConnUrl = ConnUrl(fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", pgUser, pgPassword, pgHost, pgPort, pgDatabase))
	up                         = []string{"schema", "seed"}
	down                       = reverse(up)
	readinessCheckPath         = os.Getenv("READINESS_CHECK_PATH")
	port                       = os.Getenv("GO_MIGRATE_PORT")
)

type ConnUrl string

func (c ConnUrl) String() string {
	return string(c)
}

func (c ConnUrl) WithMigDir(dir string) string {
	return string(c) + "&x-migrations-table=migration_" + dir + "_version"
}

type params struct {
	Branch     string `json:"branch"`
	Command    string `json:"command"`
	Count      string `json:"count"`
	Version    string `json:"version"`
	Directory  string `json:"directory"`
	DBType     string `json:"db_type"`
	Passphrase string `json:"passphrase"`
}

func GetConnUrl() ConnUrl {
	return ConnUrl(connUrl)
}

func reverse(s []string) []string {
	rev := []string{}
	for i := len(s) - 1; i >= 0; i-- {
		rev = append(rev, s[i])
	}
	return rev
}

func addTestSeedMigration() {
	up = append(up, TESTSEED)                  // append
	down = append([]string{TESTSEED}, down...) // prepend
}

func (p params) Auth() error {
	if passphrase, ok := os.LookupEnv("GO_MIGRATE_PASSPHRASE"); ok {
		if p.Passphrase != passphrase {
			return errors.New("not authd")
		}
	}
	return nil
}

func (p params) ReferenceName() plumbing.ReferenceName {
	return plumbing.NewBranchReferenceName(p.Branch)
}

func (p params) MigrateVersion() (int, error) {
	v, err := strconv.Atoi(p.Version)
	if err != nil {
		return 0, err
	}
	return v, nil
}

func (p params) handleEvent(ctx context.Context) error {
	_ = ctx

	err := p.Auth() // auth in lambda
	if err != nil {
		return err
	}

	err = clone(p)
	if err != nil {
		return err
	}

	switch p.Command {
	case "up":
		return upMigrate(p.Directory)
	case "down":
		return downMigrate(p.Directory)
	case "force":
		return forceVersion(p)
	case "drop":
		return dropDB()
	case "reset":
		return resetDB(p)
	default:
		return fmt.Errorf("error: command neither up, down, force, drop, or reset")
	}
}

func resetDB(p params) error {
	if p.DBType == "test" {
		addTestSeedMigration()
	}
	for _, subDir := range down {
		downMigrate(subDir)
		fmt.Println("") // add new line
	}
	dropDB() // drop db
	fmt.Println("")
	for _, subDir := range up {
		upMigrate(subDir)
		fmt.Println("")
	}
	return nil
}

func upMigrate(subDir string) error {

	pg := postgres.Postgres{}

	d, err := pg.Open(connUrl.WithMigDir(subDir))
	if err != nil {
		return err
	}
	defer func() error {
		if err := d.Close(); err != nil {
			return err
		}
		return nil
	}()

	migrationPath := MIGRATIONS_DIR + "/" + subDir
	migrationFiles, err := os.ReadDir(migrationPath)
	if err != nil {
		return err
	}

	m, err := migrate.NewWithDatabaseInstance("file://"+migrationPath, "mxfactorial", d)
	if err != nil {
		return err
	}

	fmt.Print("UP migrating from ", migrationPath+":\n")
	for _, f := range migrationFiles {
		fmt.Println(f.Name())
	}

	err = m.Up()
	if err != nil {
		return err
	}

	return nil
}

func downMigrate(subDir string) error {

	pg := postgres.Postgres{}

	d, err := pg.Open(connUrl.WithMigDir(subDir))
	if err != nil {
		return err
	}
	defer func() error {
		if err := d.Close(); err != nil {
			return err
		}
		return nil
	}()

	migrationPath := MIGRATIONS_DIR + "/" + subDir
	migrationFiles, err := os.ReadDir(migrationPath)
	if err != nil {
		return err
	}

	m, err := migrate.NewWithDatabaseInstance("file://"+migrationPath, "mxfactorial", d)
	if err != nil {
		return err
	}

	fmt.Print("DOWN migrating from ", migrationPath+":\n")
	for _, f := range migrationFiles {
		fmt.Println(f.Name())
	}

	// down migrate
	err = m.Down()
	if err != nil {
		return err
	}

	return nil
}

func forceVersion(p params) error {

	pg := postgres.Postgres{}

	d, err := pg.Open(connUrl.WithMigDir(p.Directory))
	if err != nil {
		return err
	}
	defer func() error {
		if err := d.Close(); err != nil {
			return err
		}
		return nil
	}()

	migrationPath := MIGRATIONS_DIR + "/" + p.Directory

	m, err := migrate.NewWithDatabaseInstance("file://"+migrationPath, "mxfactorial", d)
	if err != nil {
		return err
	}

	v, err := p.MigrateVersion()
	if err != nil {
		return err
	}

	fmt.Print("FORCING to ", v, " migration version in migration_"+p.Directory+"_version table\n")

	err = m.Force(v)
	if err != nil {
		return err
	}

	return nil
}

func dropDB() error {

	pg := postgres.Postgres{}

	d, err := pg.Open(connUrl.String())
	if err != nil {
		return err
	}
	defer func() error {
		if err := d.Close(); err != nil {
			return err
		}
		return nil
	}()

	m, err := migrate.NewWithDatabaseInstance("file://", "mxfactorial", d)
	if err != nil {
		return err
	}

	fmt.Print("DROPPING ", "mxfactorial", " database\n")
	err = m.Drop()
	if err != nil {
		return err
	}

	return nil
}

func clone(p params) error {

	// test for existing clone directory
	_, err := os.Stat(CLONE_DIR)
	if err == nil {

		// list files in clone directory
		files, err := os.ReadDir(CLONE_DIR)
		if err != nil {
			return err
		}

		// delete files in clone directory
		if len(files) > 0 {
			for _, f := range files {
				os.RemoveAll(path.Join([]string{CLONE_DIR, f.Name()}...))
			}
		}
	}

	// clone repo
	r, err := git.PlainClone(CLONE_DIR, false, &git.CloneOptions{
		URL:           REPO,
		ReferenceName: p.ReferenceName(),
		SingleBranch:  true,
		Progress:      nil, // os.Stdout,
	})
	if err != nil {
		return err
	}

	ref, err := r.Head()
	if err != nil {
		return err
	}

	fmt.Print("commit sha: ", ref.Hash().String()[0:8], "\n\n")
	return nil
}

func main() {
	r := gin.Default()

	// aws-lambda-web-adapter READINESS_CHECK_*
	r.GET("/"+readinessCheckPath, func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	r.POST("/", func(c *gin.Context) {

		var p params
		c.BindJSON(&p)

		err := p.handleEvent(c.Request.Context())
		if err != nil {
			log.Println(err)
			c.Status(http.StatusBadRequest)
		}

		c.Status(http.StatusOK)
	})

	r.Run(fmt.Sprintf(":%s", port))
}
