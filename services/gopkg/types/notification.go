package types

type NotificationEvent struct {
	Service *string
}

type TransactionNotificationEvent struct {
	NotificationEvent
	TransactionNotification
}
