function handleRegister(event) {
    event.preventDefault();

    // 1. Captura as 4 variáveis preenchidas no formulário
    const userAccount = {
        name: document.getElementById('regName').value,
        oab: document.getElementById('regOab').value,
        phone: document.getElementById('regPhone').value,
        email: document.getElementById('regEmail').value
    };

    // 2. Salva no localStorage (disponibilizando para qualquer página do mesmo domínio)
    localStorage.setItem('jusgestao_perfil', JSON.stringify(userAccount));

    // 3. Redireciona para o painel principal
    window.location.href = '../index.html';
}