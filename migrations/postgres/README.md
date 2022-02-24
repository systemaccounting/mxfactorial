`binami/postgres` docker image

#### issue

logs littered with `WARNING:  could not open statistics file "pg_stat_tmp/global.stat": Operation not permitted`

#### fix

mount `postgresql.conf` with `stats_temp_directory = '/tmp'`