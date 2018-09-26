import * as R from 'ramda'

export const setValues = schema => values => {
  const properties = R.pipe(
    R.values,
    R.map(p => ({ [p.name]: { ...p, value: values[p['name']] } })),
    R.mergeAll
  )(schema.properties)
  return { ...schema, properties }
}
