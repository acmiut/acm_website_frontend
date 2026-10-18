import { describe, it, expect } from 'vitest'
import {
  getCurrentPersianYear,
  isIutEmail,
  normalizePhone,
  toEnglishDigits,
  toRegisterPayload,
  validateField,
  validateRegisterForm,
} from './validation'
import type { RegisterFormValues } from './validation'

const valid: RegisterFormValues = {
  firstName: 'علی',
  lastName: 'رضایی',
  email: 'a.rezaei@ec.iut.ac.ir',
  contactNumber: '09123456789',
  studentNumber: '40012345',
  entryYear: '1400',
  educationLevel: 'Undergraduate',
  telegramId: '',
  password: 'Str0ng!Pass',
  confirmPassword: 'Str0ng!Pass',
}

describe('isIutEmail  (*@*.iut.ac.ir)', () => {
  it.each([
    'a@ec.iut.ac.ir',
    'm.rezaei@math.iut.ac.ir',
    'A.B+tag@EC.IUT.AC.IR',
    'x@cs.ce.iut.ac.ir',
    '  a@ec.iut.ac.ir  ',
  ])('accepts %s', (email) => expect(isIutEmail(email)).toBe(true))

  it.each([
    'a@iut.ac.ir', // no sub-domain label
    'a@gmail.com',
    'a@ec.iut.ac.ir.evil.com',
    'a@evil-iut.ac.ir',
    'a@eciut.ac.ir',
    'a@.iut.ac.ir',
    '@ec.iut.ac.ir',
    'a b@ec.iut.ac.ir',
    'a@ec.iut.ac.ir\nx',
    'a@@ec.iut.ac.ir',
    '',
  ])('rejects %j', (email) => expect(isIutEmail(email)).toBe(false))
})

describe('digit / phone normalisation', () => {
  it('converts Persian and Arabic digits', () => {
    expect(toEnglishDigits('۰۹۱۲۳۴۵۶۷۸۹')).toBe('09123456789')
    expect(toEnglishDigits('٠٩١٢٣')).toBe('09123')
  })

  it('normalises phone formats', () => {
    expect(normalizePhone('+98 912 345 6789')).toBe('09123456789')
    expect(normalizePhone('0098-912-345-6789')).toBe('09123456789')
    expect(normalizePhone('۰۹۱۲ ۳۴۵ ۶۷۸۹')).toBe('09123456789')
  })
})

describe('validateRegisterForm', () => {
  it('accepts a fully valid form', () => {
    expect(validateRegisterForm(valid)).toEqual({})
  })

  it('reports every required field when empty', () => {
    const errors = validateRegisterForm({
      ...valid,
      firstName: '',
      lastName: '',
      email: '',
      contactNumber: '',
      studentNumber: '',
      entryYear: '',
      educationLevel: '',
      password: '',
      confirmPassword: '',
    })
    expect(Object.keys(errors).sort()).toEqual(
      ['confirmPassword', 'contactNumber', 'educationLevel', 'email', 'entryYear', 'firstName', 'lastName', 'password', 'studentNumber'].sort(),
    )
  })

  it('telegram id is optional but validated when present', () => {
    expect(validateField('telegramId', { ...valid, telegramId: '' })).toBeUndefined()
    expect(validateField('telegramId', { ...valid, telegramId: '@ali_rezaei' })).toBeUndefined()
    expect(validateField('telegramId', { ...valid, telegramId: 'ab' })).toBeDefined()
  })

  it('checks the password policy the backend enforces', () => {
    const check = (password: string) => validateField('password', { ...valid, password })
    expect(check('Sh0rt!')).toBeDefined() // < 8
    expect(check('alllowercase1!')).toBeDefined() // no upper
    expect(check('ALLUPPERCASE1!')).toBeDefined() // no lower
    expect(check('NoDigitsHere!')).toBeDefined() // no digit
    expect(check('NoSymbol1234')).toBeDefined() // no symbol
    expect(check('Str0ng!Pass')).toBeUndefined()
  })

  it('requires matching password confirmation', () => {
    expect(validateField('confirmPassword', { ...valid, confirmPassword: 'other' })).toBeDefined()
  })

  it('limits the entry year to 1380 .. current Persian year', () => {
    const now = new Date('2026-10-13T12:00:00Z') // 1405
    expect(getCurrentPersianYear(now)).toBe(1405)
    const check = (entryYear: string) => validateField('entryYear', { ...valid, entryYear }, now)
    expect(check('1379')).toBeDefined()
    expect(check('1380')).toBeUndefined()
    expect(check('1405')).toBeUndefined()
    expect(check('1406')).toBeDefined()
    expect(check('۱۴۰۳')).toBeUndefined()
    expect(check('2024')).toBeDefined() // gregorian year is rejected
  })
})

describe('toRegisterPayload', () => {
  it('cleans values into the backend JSON shape', () => {
    const payload = toRegisterPayload({
      ...valid,
      firstName: '  علی ',
      email: ' A.Rezaei@EC.iut.ac.ir ',
      contactNumber: '+989123456789',
      studentNumber: '۴۰۰۱۲۳۴۵',
      entryYear: '۱۴۰۰',
      telegramId: '@ali_rezaei',
    })
    expect(payload).toEqual({
      firstName: 'علی',
      lastName: 'رضایی',
      email: 'a.rezaei@ec.iut.ac.ir',
      contactNumber: '09123456789',
      studentNumber: '40012345',
      entryYear: 1400,
      educationLevel: 'Undergraduate',
      telegramId: 'ali_rezaei',
      password: 'Str0ng!Pass',
    })
  })

  it('sends null for an empty telegram id', () => {
    expect(toRegisterPayload(valid).telegramId).toBeNull()
  })
})
