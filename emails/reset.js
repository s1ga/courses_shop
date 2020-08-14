const keys = require('../keys/index')

module.exports = function (email, token) {
    return {
        to: email,
        from: keys.EMAIL_FROM,
        subject: 'Восстановление доступа',
        html: `
            <h1>Забыли пароль?</h1>
            <p>Нажмите на ссылку ниже:</p>
            <a href="${keys.BASE_URL}/auth/password/${token}">Восстановить доступ</a>
        `,
    }
}