import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import RegisterPage from './RegisterPage'
import CheckEmailPage from './CheckEmailPage'
import ConfirmEmailPage from './ConfirmEmailPage'

const fetchMock = vi.fn()

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const CheckEmailProbe = () => <div data-testid="state">{JSON.stringify(useLocation().state)}</div>

const renderRegister = () =>
  render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/check-email" element={<CheckEmailProbe />} />
      </Routes>
    </MemoryRouter>,
  )

describe('RegisterPage', () => {
  const fillAll = (email = 'a.rezaei@ec.iut.ac.ir') => {
    fireEvent.change(document.getElementById('firstName')!, { target: { value: 'علی' } })
    fireEvent.change(document.getElementById('lastName')!, { target: { value: 'رضایی' } })
    fireEvent.change(document.getElementById('email')!, { target: { value: email } })
    fireEvent.change(document.getElementById('contactNumber')!, { target: { value: '۰۹۱۲۳۴۵۶۷۸۹' } })
    fireEvent.change(document.getElementById('studentNumber')!, { target: { value: '40012345' } })
    fireEvent.change(document.getElementById('entryYear')!, { target: { value: '1400' } })
    fireEvent.change(document.getElementById('educationLevel')!, { target: { value: 'Master' } })
    fireEvent.change(document.getElementById('password')!, { target: { value: 'Str0ng!Pass' } })
    fireEvent.change(document.getElementById('confirmPassword')!, { target: { value: 'Str0ng!Pass' } })
  }

  it('does not call the backend when the form is empty and shows errors', async () => {
    renderRegister()
    fireEvent.click(screen.getByRole('button', { name: /ثبت‌نام و ارسال ایمیل تأیید/ }))

    expect((await screen.findAllByRole('alert')).length).toBeGreaterThan(5)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects an email outside *.iut.ac.ir', async () => {
    renderRegister()
    fillAll('someone@gmail.com')
    fireEvent.click(screen.getByRole('button', { name: /ثبت‌نام و ارسال ایمیل تأیید/ }))

    expect(await screen.findByText('ایمیل باید به شکل name@faculty.iut.ac.ir باشد.')).toBeTruthy()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('posts the cleaned data and moves to the check-email page', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { message: 'OK', resendAfterSeconds: 60 }))
    renderRegister()
    fillAll()
    fireEvent.click(screen.getByRole('button', { name: /ثبت‌نام و ارسال ایمیل تأیید/ }))

    await waitFor(() => expect(screen.getByTestId('state')).toBeTruthy())

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/auth/register')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toEqual({
      firstName: 'علی',
      lastName: 'رضایی',
      email: 'a.rezaei@ec.iut.ac.ir',
      contactNumber: '09123456789',
      studentNumber: '40012345',
      entryYear: 1400,
      educationLevel: 'Master',
      telegramId: null,
      password: 'Str0ng!Pass',
    })
    expect(JSON.parse(screen.getByTestId('state').textContent!)).toEqual({
      email: 'a.rezaei@ec.iut.ac.ir',
      resendAfterSeconds: 60,
    })
  })

  it('shows the server error under the email field (already registered)', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(409, {
        message: 'این ایمیل قبلاً ثبت‌نام شده است.',
        errors: { email: ['این ایمیل قبلاً ثبت‌نام شده است.'] },
      }),
    )
    renderRegister()
    fillAll()
    fireEvent.click(screen.getByRole('button', { name: /ثبت‌نام و ارسال ایمیل تأیید/ }))

    const emailField = document.getElementById('email')!
    await waitFor(() => expect(emailField.getAttribute('aria-invalid')).toBe('true'))
    expect(screen.getAllByText('این ایمیل قبلاً ثبت‌نام شده است.').length).toBeGreaterThan(0)
  })

  it('maps ASP.NET PascalCase validation keys onto fields', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(400, { title: 'One or more validation errors occurred.', errors: { StudentNumber: ['شماره دانشجویی معتبر نیست.'] } }),
    )
    renderRegister()
    fillAll()
    fireEvent.click(screen.getByRole('button', { name: /ثبت‌نام و ارسال ایمیل تأیید/ }))

    await waitFor(() => expect(document.getElementById('studentNumber')!.getAttribute('aria-invalid')).toBe('true'))
  })
})

describe('CheckEmailPage', () => {
  it('redirects to the form when opened without a sign-up in progress', () => {
    render(
      <MemoryRouter initialEntries={['/register/check-email']}>
        <Routes>
          <Route path="/register" element={<div>FORM</div>} />
          <Route path="/register/check-email" element={<CheckEmailPage />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('FORM')).toBeTruthy()
  })

  it('shows the address and keeps resend disabled during the cool-down', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/register/check-email', state: { email: 'a@ec.iut.ac.ir', resendAfterSeconds: 60 } }]}>
        <Routes>
          <Route path="/register/check-email" element={<CheckEmailPage />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('a@ec.iut.ac.ir')).toBeTruthy()
    const button = screen.getByRole('button', { name: /ارسال دوباره ایمیل/ }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
  })
})

describe('ConfirmEmailPage', () => {
  const renderConfirm = (search: string) =>
    render(
      <MemoryRouter initialEntries={[`/confirm-email${search}`]}>
        <Routes>
          <Route path="/confirm-email" element={<ConfirmEmailPage />} />
        </Routes>
      </MemoryRouter>,
    )

  it('confirms the token exactly once and shows success', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { message: 'OK' }))
    renderConfirm('?token=abc123')

    expect(await screen.findByText('ایمیل شما تأیید شد')).toBeTruthy()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/auth/confirm-email')
    expect(JSON.parse(init.body)).toEqual({ token: 'abc123' })
  })

  it('shows the backend message for an invalid or expired link', async () => {
    fetchMock.mockResolvedValue(jsonResponse(400, { message: 'لینک تأیید نامعتبر است یا منقضی شده است.' }))
    renderConfirm('?token=bad')

    expect(await screen.findByText('تأیید ایمیل انجام نشد')).toBeTruthy()
    expect(screen.getByText('لینک تأیید نامعتبر است یا منقضی شده است.')).toBeTruthy()
  })

  it('does not call the backend when the token is missing', () => {
    renderConfirm('')
    expect(screen.getByText('تأیید ایمیل انجام نشد')).toBeTruthy()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
