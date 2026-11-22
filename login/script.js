function handleLogin(event) {
    event.preventDefault();
    const name = document.getElementById('loginName').value.trim();
    const oab = document.getElementById('loginOab').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!name || !password) {
        alert('Por favor, preencha o seu nome e a senha de acesso.');
        return;
    }

    // Cria o perfil mantendo a senha digitada pelo usuário
    const profile = {
        name: name,
        oab: oab ? oab : 'OAB Não Informada',
        password: password // Salva exatamente a senha digitada aqui
    };

    localStorage.setItem('jusgestao_perfil', JSON.stringify(profile));
    
    // Redireciona para o painel principal (ajuste o caminho se necessário)
    window.location.href = '../index.html'; 
}