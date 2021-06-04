package lambdapg

import (
	"time"

	"github.com/jackc/pgtype"
	"github.com/jackc/pgx/v4"
	"github.com/shopspring/decimal"
	"github.com/systemaccounting/mxfactorial/services/gopkg/tools"
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
		var ID *types.ID
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
	var ID *types.ID
	var ruleInstanceID *types.ID
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

	// conversions to app layer
	geoPoint, err := geoPointToStringPtr(authorDeviceLatlng)
	if err != nil {
		return nil, err
	}

	sumVal := tools.NullDecimalToString(sumValue)

	t := types.Transaction{
		ID:                 ID,
		RuleInstanceID:     ruleInstanceID,
		Author:             author,
		AuthorDeviceID:     authorDeviceID,
		AuthorDeviceLatlng: geoPoint,
		AuthorRole:         authorRole,
		EquilibriumTime:    tools.NullTimeToString(equilibriumTime),
		SumValue:           &sumVal,
	}
	return &t, nil
}

// UnmarshalTransactions ...
func UnmarshalTransactions(
	rows pgx.Rows,
) ([]*types.Transaction, error) {
	var transactions []*types.Transaction
	defer rows.Close()
	for rows.Next() {
		var ID *types.ID
		var ruleInstanceID *types.ID
		var author *string
		var authorDeviceID *string
		var authorDeviceLatlng pgtype.Point
		var authorRole *string
		var equilibriumTime null.Time
		var sumValue decimal.NullDecimal
		var createdAt time.Time
		err := rows.Scan(
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
		// conversions to app layer
		geoPoint, err := geoPointToStringPtr(authorDeviceLatlng)
		if err != nil {
			return nil, err
		}

		sumVal := tools.NullDecimalToString(sumValue)

		t := &types.Transaction{
			ID:                 ID,
			RuleInstanceID:     ruleInstanceID,
			Author:             author,
			AuthorDeviceID:     authorDeviceID,
			AuthorDeviceLatlng: geoPoint,
			AuthorRole:         authorRole,
			EquilibriumTime:    tools.NullTimeToString(equilibriumTime),
			SumValue:           &sumVal,
		}
		transactions = append(transactions, t)
	}
	err := rows.Err()
	if err != nil {
		return nil, err
	}
	return transactions, nil
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
		var ID *types.ID
		var transactionID *types.ID
		var itemID *string
		var price decimal.Decimal
		var quantity decimal.Decimal
		var debitorFirst *bool
		var ruleInstanceID *types.ID
		var unitOfMeasurement *string
		var unitsMeasured decimal.NullDecimal
		var debitor *string
		var creditor *string
		var debitorProfileID *types.ID
		var creditorProfileID *types.ID
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
			DebitorApprovalTime:    tools.NullTimeToString(debitorApprovalTime),
			CreditorApprovalTime:   tools.NullTimeToString(creditorApprovalTime),
			DebitorRejectionTime:   tools.NullTimeToString(debitorRejectionTime),
			CreditorRejectionTime:  tools.NullTimeToString(creditorRejectionTime),
			DebitorExpirationTime:  tools.NullTimeToString(debitorExpirationTime),
			CreditorExpirationTime: tools.NullTimeToString(creditorExpirationTime),
		}
		trItems = append(trItems, &i)
	}
	err := rows.Err()
	if err != nil {
		return nil, err
	}
	return trItems, nil
}

// UnmarshalApprovals ...
func UnmarshalApprovals(
	rows pgx.Rows,
) ([]*types.Approval, error) {
	var approvals []*types.Approval
	defer rows.Close()
	for rows.Next() {
		var ID *types.ID
		var ruleInstanceID *types.ID
		var transactionID *types.ID
		var trItemID *types.ID
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
		a := types.Approval{
			ID:                ID,
			RuleInstanceID:    ruleInstanceID,
			TransactionID:     transactionID,
			TransactionItemID: trItemID,
			AccountName:       accountName,
			AccountRole:       accountRole,
			DeviceID:          deviceID,
			DeviceLatlng:      geoPoint,
			ApprovalTime:      tools.NullTimeToString(approvalTime),
			ExpirationTime:    tools.NullTimeToString(expirationTime),
		}
		approvals = append(approvals, &a)
	}
	err := rows.Err()
	if err != nil {
		return nil, err
	}
	return approvals, nil
}

// UnmarshalTransactionNotifications ...
func UnmarshalTransactionNotifications(
	rows pgx.Rows,
) ([]*types.TransactionNotification, error) {
	var transNotifs []*types.TransactionNotification
	defer rows.Close()
	for rows.Next() {
		var ID *types.ID
		var transactionID *types.ID
		var accountName *string
		var accountRole *string
		var message *pgtype.JSONB
		var createdAt *time.Time
		err := rows.Scan(
			&ID,
			&transactionID,
			&accountName,
			&accountRole,
			&message,
			&createdAt,
		)
		if err != nil {
			return nil, err
		}
		n := types.TransactionNotification{
			ID:            ID,
			TransactionID: transactionID,
			AccountName:   accountName,
			AccountRole:   accountRole,
			Message:       message,
			CreatedAt:     createdAt,
		}
		transNotifs = append(transNotifs, &n)
	}
	err := rows.Err()
	if err != nil {
		return nil, err
	}
	return transNotifs, nil
}

// UnmarshalWebsockets ...
func UnmarshalWebsockets(
	rows pgx.Rows,
) ([]*types.Websocket, error) {
	var wss []*types.Websocket
	defer rows.Close()
	for rows.Next() {
		var ID *types.ID
		var connectionID *string
		var accountName *string
		var epochCreatedAt *int64
		var createdAt *time.Time
		err := rows.Scan(
			&ID,
			&connectionID,
			&accountName,
			&epochCreatedAt,
			&createdAt,
		)
		if err != nil {
			return nil, err
		}
		w := types.Websocket{
			ID:             ID,
			ConnectionID:   connectionID,
			AccountName:    accountName,
			EpochCreatedAt: epochCreatedAt,
			CreatedAt:      createdAt,
		}
		wss = append(wss, &w)
	}
	err := rows.Err()
	if err != nil {
		return nil, err
	}
	return wss, nil
}

func UnmarshalWebsocket(
	row pgx.Row,
) (*types.Websocket, error) {
	// scanning into variables first to avoid:
	// can't scan into dest[3]: cannot scan null into *string
	var ID *types.ID
	var connectionID *string
	var accountName *string
	var epochCreatedAt *int64
	var createdAt *time.Time
	err := row.Scan(
		&ID,
		&connectionID,
		&accountName,
		&epochCreatedAt,
		&createdAt,
	)
	if err != nil {
		return nil, err
	}
	w := &types.Websocket{
		ID:             ID,
		ConnectionID:   connectionID,
		AccountName:    accountName,
		EpochCreatedAt: epochCreatedAt,
		CreatedAt:      createdAt,
	}
	return w, nil
}

func UnmarshalAccountBalance(
	row pgx.Row,
) (decimal.Decimal, error) {
	var AccountBalance decimal.Decimal
	err := row.Scan(&AccountBalance)
	if err != nil {
		return decimal.Decimal{}, err
	}
	return AccountBalance, nil
}
