// Code generated by MockGen. DO NOT EDIT.
// Source: github.com/jackc/pgx/v4 (interfaces: Rows)

// Package mock is a generated GoMock package.
package mock

import (
	gomock "github.com/golang/mock/gomock"
	pgconn "github.com/jackc/pgconn"
	pgproto3 "github.com/jackc/pgproto3/v2"
	reflect "reflect"
)

// MockRows is a mock of Rows interface
type MockRows struct {
	ctrl     *gomock.Controller
	recorder *MockRowsMockRecorder
}

// MockRowsMockRecorder is the mock recorder for MockRows
type MockRowsMockRecorder struct {
	mock *MockRows
}

// NewMockRows creates a new mock instance
func NewMockRows(ctrl *gomock.Controller) *MockRows {
	mock := &MockRows{ctrl: ctrl}
	mock.recorder = &MockRowsMockRecorder{mock}
	return mock
}

// EXPECT returns an object that allows the caller to indicate expected use
func (m *MockRows) EXPECT() *MockRowsMockRecorder {
	return m.recorder
}

// Close mocks base method
func (m *MockRows) Close() {
	m.ctrl.T.Helper()
	m.ctrl.Call(m, "Close")
}

// Close indicates an expected call of Close
func (mr *MockRowsMockRecorder) Close() *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Close", reflect.TypeOf((*MockRows)(nil).Close))
}

// CommandTag mocks base method
func (m *MockRows) CommandTag() pgconn.CommandTag {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "CommandTag")
	ret0, _ := ret[0].(pgconn.CommandTag)
	return ret0
}

// CommandTag indicates an expected call of CommandTag
func (mr *MockRowsMockRecorder) CommandTag() *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "CommandTag", reflect.TypeOf((*MockRows)(nil).CommandTag))
}

// Err mocks base method
func (m *MockRows) Err() error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Err")
	ret0, _ := ret[0].(error)
	return ret0
}

// Err indicates an expected call of Err
func (mr *MockRowsMockRecorder) Err() *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Err", reflect.TypeOf((*MockRows)(nil).Err))
}

// FieldDescriptions mocks base method
func (m *MockRows) FieldDescriptions() []pgproto3.FieldDescription {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "FieldDescriptions")
	ret0, _ := ret[0].([]pgproto3.FieldDescription)
	return ret0
}

// FieldDescriptions indicates an expected call of FieldDescriptions
func (mr *MockRowsMockRecorder) FieldDescriptions() *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "FieldDescriptions", reflect.TypeOf((*MockRows)(nil).FieldDescriptions))
}

// Next mocks base method
func (m *MockRows) Next() bool {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Next")
	ret0, _ := ret[0].(bool)
	return ret0
}

// Next indicates an expected call of Next
func (mr *MockRowsMockRecorder) Next() *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Next", reflect.TypeOf((*MockRows)(nil).Next))
}

// RawValues mocks base method
func (m *MockRows) RawValues() [][]byte {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "RawValues")
	ret0, _ := ret[0].([][]byte)
	return ret0
}

// RawValues indicates an expected call of RawValues
func (mr *MockRowsMockRecorder) RawValues() *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "RawValues", reflect.TypeOf((*MockRows)(nil).RawValues))
}

// Scan mocks base method
func (m *MockRows) Scan(arg0 ...interface{}) error {
	m.ctrl.T.Helper()
	varargs := []interface{}{}
	for _, a := range arg0 {
		varargs = append(varargs, a)
	}
	ret := m.ctrl.Call(m, "Scan", varargs...)
	ret0, _ := ret[0].(error)
	return ret0
}

// Scan indicates an expected call of Scan
func (mr *MockRowsMockRecorder) Scan(arg0 ...interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Scan", reflect.TypeOf((*MockRows)(nil).Scan), arg0...)
}

// Values mocks base method
func (m *MockRows) Values() ([]interface{}, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Values")
	ret0, _ := ret[0].([]interface{})
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// Values indicates an expected call of Values
func (mr *MockRowsMockRecorder) Values() *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Values", reflect.TypeOf((*MockRows)(nil).Values))
}
