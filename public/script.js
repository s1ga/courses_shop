const toCurrency = price => {
    return new Intl.NumberFormat('by-BY', {
      currency: 'byn',
      style: 'currency'
    }).format(price)
}

const toDate = date => {
    return new Intl.DateTimeFormat('by-BY', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(new Date(date))
}

document.querySelectorAll('.date').forEach(node => {
    node.textContent = toDate(node.textContent)
})

document.querySelectorAll('.price').forEach(node => {
    node.textContent = toCurrency(node.textContent)
})
  
  const $card = document.querySelector('#card')
  if ($card) {
    $card.addEventListener('click', event => {
      if (event.target.classList.contains('remove')) {
        const id = event.target.dataset.id
        const csrf = event.target.dataset.csrf
        
        fetch('/card/remove/' + id, {
          method: 'delete',
          headers: {
            'X-XSRF-TOKEN': csrf
        }
        }).then(res => res.json())
          .then(card => {
            if (card.courses.length) {
              const html = card.courses.map(c => {
                return `
                <tr>
                <td>${c.title}</td>
                <td>${c.count}</td>
                <td>
                    <button class="btn btn-small add" data-id="${c.id}" data-csrf="${csrf}">Добавить</button>
                    <button class="btn btn-small remove" data-id="${c.id}" data-csrf="${csrf}">Удалить</button>
                </td>
                </tr>
                `
              }).join('')
              $card.querySelector('tbody').innerHTML = html
              $card.querySelector('.price').textContent = toCurrency(card.price)
            } else {
              $card.innerHTML = '<p>Корзина пуста</p>'
            }
          })
      } else if (event.target.classList.contains('add')) {
            const id = event.target.dataset.id
            const csrf = event.target.dataset.csrf
            
            fetch('/card/add/' + id, {
                method: 'post',
                headers: {
                    'X-XSRF-TOKEN': csrf
                }
            }).then(res => res.json())
            .then(card => {
                if (card.courses.length) {
                const html = card.courses.map(c => {
                    return `
                    <tr>
                    <td>${c.title}</td>
                    <td>${c.count}</td>
                    <td>
                        <button class="btn btn-small add" data-id="${c.id}" data-csrf="${csrf}">Добавить</button>
                        <button class="btn btn-small remove" data-id="${c.id}" data-csrf="${csrf}">Удалить</button>
                    </td>
                    </tr>
                    `
                }).join('')
                $card.querySelector('tbody').innerHTML = html
                $card.querySelector('.price').textContent = toCurrency(card.price)
                } else {
                $card.innerHTML = '<p>Корзина пуста</p>'
                }
            })
      }
      
    })
  } 


M.Tabs.init(document.querySelectorAll('.tabs'));