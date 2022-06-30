// Code generated by MockGen. DO NOT EDIT.
// Source: github.com/systemaccounting/mxfactorial/services/gopkg/types (interfaces: TrItemListHelper)

// Package mock_types is a generated GoMock package.
package mock_types

import (
	reflect "reflect"

	gomock "github.com/golang/mock/gomock"
	decimal "github.com/shopspring/decimal"
)

// MockTrItemListHelper is a mock of TrItemListHelper interface.
type MockTrItemListHelper struct {
	ctrl     *gomock.Controller
	recorder *MockTrItemListHelperMockRecorder
}

// MockTrItemListHelperMockRecorder is the mock recorder for MockTrItemListHelper.
type MockTrItemListHelperMockRecorder struct {
	mock *MockTrItemListHelper
}

// NewMockTrItemListHelper creates a new mock instance.
func NewMockTrItemListHelper(ctrl *gomock.Controller) *MockTrItemListHelper {
	mock := &MockTrItemListHelper{ctrl: ctrl}
	mock.recorder = &MockTrItemListHelperMockRecorder{mock}
	return mock
}

// EXPECT returns an object that allows the caller to indicate expected use.
func (m *MockTrItemListHelper) EXPECT() *MockTrItemListHelperMockRecorder {
	return m.recorder
}

// ListUniqueAccountsFromTrItems mocks base method.
func (m *MockTrItemListHelper) ListUniqueAccountsFromTrItems() []interface{} {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "ListUniqueAccountsFromTrItems")
	ret0, _ := ret[0].([]interface{})
	return ret0
}

// ListUniqueAccountsFromTrItems indicates an expected call of ListUniqueAccountsFromTrItems.
func (mr *MockTrItemListHelperMockRecorder) ListUniqueAccountsFromTrItems() *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "ListUniqueAccountsFromTrItems", reflect.TypeOf((*MockTrItemListHelper)(nil).ListUniqueAccountsFromTrItems))
}

// ListUniqueDebitorAccountsFromTrItems mocks base method.
func (m *MockTrItemListHelper) ListUniqueDebitorAccountsFromTrItems() []string {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "ListUniqueDebitorAccountsFromTrItems")
	ret0, _ := ret[0].([]string)
	return ret0
}

// ListUniqueDebitorAccountsFromTrItems indicates an expected call of ListUniqueDebitorAccountsFromTrItems.
func (mr *MockTrItemListHelperMockRecorder) ListUniqueDebitorAccountsFromTrItems() *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "ListUniqueDebitorAccountsFromTrItems", reflect.TypeOf((*MockTrItemListHelper)(nil).ListUniqueDebitorAccountsFromTrItems))
}

// MapDebitorsToRequiredFunds mocks base method.
func (m *MockTrItemListHelper) MapDebitorsToRequiredFunds() map[string]decimal.Decimal {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "MapDebitorsToRequiredFunds")
	ret0, _ := ret[0].(map[string]decimal.Decimal)
	return ret0
}

// MapDebitorsToRequiredFunds indicates an expected call of MapDebitorsToRequiredFunds.
func (mr *MockTrItemListHelperMockRecorder) MapDebitorsToRequiredFunds() *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "MapDebitorsToRequiredFunds", reflect.TypeOf((*MockTrItemListHelper)(nil).MapDebitorsToRequiredFunds))
}
