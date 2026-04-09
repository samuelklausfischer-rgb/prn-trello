routerAdd('POST', '/backend/v1/auth/reset-password', (e) => {
  const body = e.requestInfo().body
  const email = body.email || ''
  const password = body.password || ''
  const passwordConfirm = body.passwordConfirm || ''

  let errors = {}

  if (!email) {
    errors.email = { code: 'validation_required', message: 'O e-mail é obrigatório.' }
  }

  if (!password) {
    errors.password = { code: 'validation_required', message: 'A senha é obrigatória.' }
  } else if (password.length < 8) {
    errors.password = {
      code: 'validation_length',
      message: 'A senha deve ter pelo menos 8 caracteres.',
    }
  }

  if (password !== passwordConfirm) {
    errors.passwordConfirm = { code: 'validation_mismatch', message: 'As senhas não coincidem.' }
  }

  if (Object.keys(errors).length > 0) {
    return e.json(400, { message: 'Erro de validação.', data: errors })
  }

  try {
    const user = $app.findAuthRecordByEmail('users', email)
    user.setPassword(password)
    $app.save(user)
    return e.json(200, { success: true })
  } catch (err) {
    return e.json(400, {
      message: 'Erro de validação.',
      data: { email: { code: 'not_found', message: 'E-mail não encontrado.' } },
    })
  }
})
