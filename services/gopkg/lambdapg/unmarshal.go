package lambdapg

import (
	"time"

	"github.com/jackc/pgtype"
	"github.com/jackc/pgx/v4"
	"github.com/shopspring/decimal"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
	"gopkg.in/guregu/null.v4"
)

// UnmarshalID ...
func UnmarshalID(
	row pgx.Row,
) (int64, error) {
	var ID int64
	err := row.Scan(&ID)
	if err != nil {
		return 0, err
	}
	return ID, nil
}

// UnmarshalIDs ...
func UnmarshalAccountProfileIDs(
	rows pgx.Rows,
) ([]*types.AccountProfileID, error) {
	var profileIDs []*types.AccountProfileID
	defer rows.Close()
	for rows.Next() {
		var ID *int32
		var accountName *string
		err := rows.Scan(
			&ID,
			&accountName,
		)
		if err != nil {
			return nil, err
		}
		profileID := &types.AccountProfileID{
			ID:          ID,
			AccountName: accountName,
		}
		profileIDs = append(profileIDs, profileID)
	}
	err := rows.Err()
	if err != nil {
		return nil, err
	}
	return profileIDs, nil
}

// UnmarshalTransaction ...
func UnmarshalTransaction(
	row pgx.Row,
) (*types.Transaction, error) {
	// scanning into variables first to avoid:
	// can't scan into dest[3]: cannot scan null into *string
	var ID *int32
	var ruleInstanceID *int32
	var author *string
	var authorDeviceID *string
	var authorDeviceLatlng pgtype.Point
	var authorRole *string
	var equilibriumTime null.Time
	var sumValue decimal.NullDecimal
	var createdAt time.Time

	err := row.Scan(
		&ID,
		&ruleInstanceID,
		&author,
		&authorDeviceID,
		&authorDeviceLatlng,
		&authorRole,
		&equilibriumTime,
		&sumValue,
		&createdAt, // not using
	)
	if err != nil {
		return nil, err
	}
	geoPoint, err := geoPointToStringPtr(authorDeviceLatlng)
	if err != nil {
		return nil, err
	}

	t := types.Transaction{
		ID:                 ID,
		RuleInstanceID:     ruleInstanceID,
		Author:             author,
		AuthorDeviceID:     authorDeviceID,
		AuthorDeviceLatlng: geoPoint,
		AuthorRole:         authorRole,
		EquilibriumTime:    nullTimeToString(equilibriumTime),
		SumValue:           sumValue,
	}
	return &t, nil
}

func geoPointToStringPtr(gp pgtype.Point) (*string, error) {
	var geoPoint *string
	geoPoint = new(string)
	if gp.Get() == nil {
		geoPoint = nil
	} else {
		var b []byte
		// https://github.com/jackc/pgtype/blob/4a3a424dff9a94723972bbe0510950feb7465087/point.go#L140
		b, err := gp.EncodeText(nil, b)
		if err != nil {
			return nil, err
		}
		*geoPoint = string(b)
	}
	return geoPoint, nil
}

// UnmarshalIDs ...
func UnmarshalIDs(
	rows pgx.Rows,
) ([]int64, error) {
	// https://github.com/jackc/pgx/blob/909b81a16372d7e2574b2b11e8993895bdd5a065/conn.go#L676-L677
	var IDs []int64
	defer rows.Close()
	for rows.Next() {
		var ID int64
		err := rows.Scan(&ID)
		if err != nil {
			return nil, err
		}
		IDs = append(IDs, ID)
	}
	err := rows.Err()
	if err != nil {
		return nil, err
	}
	return IDs, nil
}

// UnmarshalTrItems ...
func UnmarshalTrItems(
	rows pgx.Rows,
) ([]*types.TransactionItem, error) {
	var trItems []*types.TransactionItem
	defer rows.Close()
	for rows.Next() {
		var ID *int32
		var transactionID *int32
		var itemID *string
		var price decimal.Decimal
		var quantity decimal.Decimal
		var debitorFirst *bool
		var ruleInstanceID *int32
		var unitOfMeasurement *string
		var unitsMeasured decimal.NullDecimal
		var debitor *string
		var creditor *string
		var debitorProfileID *int32
		var creditorProfileID *int32
		var debitorApprovalTime null.Time
		var creditorApprovalTime null.Time
		var debitorRejectionTime null.Time
		var creditorRejectionTime null.Time
		var debitorExpirationTime null.Time
		var creditorExpirationTime null.Time
		err := rows.Scan(
			&ID,
			&transactionID,
			&itemID,
			&price,
			&quantity,
			&debitorFirst,
			&ruleInstanceID,
			&unitOfMeasurement,
			&unitsMeasured,
			&debitor,
			&creditor,
			&debitorProfileID,
			&creditorProfileID,
			&debitorApprovalTime,
			&creditorApprovalTime,
			&debitorRejectionTime,
			&creditorRejectionTime,
			&debitorExpirationTime,
			&creditorExpirationTime,
		)
		if err != nil {
			return nil, err
		}
		// debitorApprovalString := pgTimeToString(debitorApprovalTime)
		i := types.TransactionItem{
			ID:                     ID,
			TransactionID:          transactionID,
			ItemID:                 itemID,
			Price:                  price,
			Quantity:               quantity,
			DebitorFirst:           debitorFirst,
			RuleInstanceID:         ruleInstanceID,
			UnitOfMeasurement:      unitOfMeasurement,
			UnitsMeasured:          unitsMeasured,
			Debitor:                debitor,
			Creditor:               creditor,
			DebitorProfileID:       debitorProfileID,
			CreditorProfileID:      creditorProfileID,
			DebitorApprovalTime:    nullTimeToString(debitorApprovalTime),
			CreditorApprovalTime:   nullTimeToString(creditorApprovalTime),
			DebitorRejectionTime:   nullTimeToString(debitorRejectionTime),
			CreditorRejectionTime:  nullTimeToString(creditorRejectionTime),
			DebitorExpirationTime:  nullTimeToString(debitorExpirationTime),
			CreditorExpirationTime: nullTimeToString(creditorExpirationTime),
		}
		trItems = append(trItems, &i)
	}
	err := rows.Err()
	if err != nil {
		return nil, err
	}
	return trItems, nil
}

// UnmarshalApprovers ...
func UnmarshalApprovers(
	rows pgx.Rows,
) ([]*types.Approver, error) {
	var approvers []*types.Approver
	defer rows.Close()
	for rows.Next() {
		var ID *int32
		var ruleInstanceID *int32
		var transactionID *int32
		var trItemID *int32
		var accountName *string
		var accountRole *string
		var deviceID *string
		var deviceLatlng pgtype.Point
		var approvalTime null.Time
		// var rejectionTime null.Time
		var expirationTime null.Time
		err := rows.Scan(
			&ID,
			&ruleInstanceID,
			&transactionID,
			&trItemID,
			&accountName,
			&accountRole,
			&deviceID,
			&deviceLatlng,
			&approvalTime,
			// &rejectionTime,
			&expirationTime,
		)
		if err != nil {
			return nil, err
		}
		geoPoint, err := geoPointToStringPtr(deviceLatlng)
		if err != nil {
			return nil, err
		}
		a := types.Approver{
			ID:                ID,
			RuleInstanceID:    ruleInstanceID,
			TransactionID:     transactionID,
			TransactionItemID: trItemID,
			AccountName:       accountName,
			AccountRole:       accountRole,
			DeviceID:          deviceID,
			DeviceLatlng:      geoPoint,
			ApprovalTime:      nullTimeToString(approvalTime),
			// RejectionTime:     nullTimeToString(rejectionTime),
			ExpirationTime: nullTimeToString(expirationTime),
		}
		approvers = append(approvers, &a)
	}
	err := rows.Err()
	if err != nil {
		return nil, err
	}
	return approvers, nil
}

func nullTimeToString(t null.Time) *string {
	pgTime := t.ValueOrZero()
	if pgTime.IsZero() {
		return nil
	}
	f := pgTime.Format("2006-01-02T15:04:05.000000Z")
	return &f
}