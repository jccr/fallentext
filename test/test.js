import { testData } from './testdata.js'
import { fallenText } from '../fallentext.js'

test.each(testData)('%s `%s`', (_, input, expected) => {
  document.body.innerHTML = input
  const actual = fallenText(document.body)
  expect(actual).toEqual(expected)
})

test('<title> text is preserved', () =>{
  document.documentElement.innerHTML = ''
  document.title = 'Document title'
  const actual = fallenText(document.documentElement)
  expect(actual).toEqual(document.title)
})