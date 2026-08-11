// Base de dados padrão para o primeiro acesso
const defaultDatabase = [
    {
        code: 'CLI-1001',
        name: 'Maria Silva',
        cpf: '123.456.789-00',
        age: '34 anos (12/05/1990)',
        process: '0001234-56.2023.8.26.0100',
        type: 'Trabalhista',
        court: '1ª Vara do Trabalho',
        status: 'Em Andamento',
        phone: '(11) 98765-4321',
        email: 'maria.silva@email.com',
        deadline: '18/10/2026 - Contestação',
        fee: 'R$ 5.000,00',
        feeStatus: 'Recebido'
    },
    {
        code: 'CLI-1002',
        name: 'João Santos',
        cpf: '987.654.321-99',
        age: '45 anos (20/08/1979)',
        process: '0009876-12.2022.8.26.0100',
        type: 'Cível',
        court: '3ª Vara Cível',
        status: 'Aguardando Prazo',
        phone: '(11) 91234-5678',
        email: 'joao.santos@email.com',
        deadline: '25/10/2026 - Réplica',
        fee: 'R$ 8.500,00',
        feeStatus: 'Pendente'
    }
];

// Dados padrão do Perfil
const defaultProfile = {
    name: 'Dr. Ricardo Alves',
    oab: 'OAB/SP 452.890',
    email: 'ricardo.alves@jusgestao.com',
    phone: '(11) 99999-8888'
};

// Carregamento do LocalStorage com fallback seguro
let clientsDatabase = JSON.parse(localStorage.getItem('jusgestao_clientes')) || defaultDatabase;
let userProfile = JSON.parse(localStorage.getItem('jusgestao_perfil')) || defaultProfile;

// Salvar dados no LocalStorage
function saveData() {
    localStorage.setItem('jusgestao_clientes', JSON.stringify(clientsDatabase));
}

function saveProfileData() {
    localStorage.setItem('jusgestao_perfil', JSON.stringify(userProfile));
}

// Configuração de Títulos das Abas
const pageTitles = {
    painel: { title: 'Gestão Integrada de Clientes', sub: 'Consulte, organize e gerencie fichas jurídicas e processos em tempo real.' },
    clientes: { title: 'Base Completa de Clientes', sub: 'Gerenciamento e histórico dos clientes cadastrados.' },
    processos: { title: 'Andamento de Processos', sub: 'Status, varas e acompanhamento de ações judiciais.' },
    prazos: { title: 'Controle de Prazos e Audiências', sub: 'Próximos compromissos e audiências agendadas.' },
    financeiro: { title: 'Gestão Financeira & Honorários', sub: 'Acompanhamento de faturamento, liquidações e honorários a receber.' },
    documentos: { title: 'Modelos e Documentos Vinculados', sub: 'Download de minutas e documentos padrão.' }
};

// Seletores de Elementos
const searchInput = document.getElementById('clientSearch');
const suggestionsList = document.getElementById('suggestionsList');

// Troca de Abas
function switchTab(tabId, element) {
    document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active'));
    if (element) element.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) targetTab.classList.add('active');

    if (pageTitles[tabId]) {
        document.getElementById('pageTitle').textContent = pageTitles[tabId].title;
        document.getElementById('pageSubtitle').textContent = pageTitles[tabId].sub;
    }
}

// Classe de estilo da Badge de Status
function getBadgeClass(status) {
    if (status === 'Em Andamento' || status === 'Recebido') return 'badge-active';
    if (status === 'Aguardando Prazo' || status === 'Pendente') return 'badge-pending';
    return 'badge-closed';
}

// Renderizar Informações na Tela
function renderAll() {
    // 1. Tabela Resumida do Painel
    document.querySelectorAll('.clientsTableBody').forEach(tbody => {
        tbody.innerHTML = '';
        clientsDatabase.forEach(client => {
            const tr = document.createElement('tr');
            tr.style.cursor = 'pointer';
            tr.onclick = () => {
                switchTab('painel', document.querySelectorAll('.nav-link')[0]);
                fillFormWithClient(client);
            };
            tr.innerHTML = `
                <td><strong>${client.code}</strong></td>
                <td>${client.name}</td>
                <td>${client.cpf}</td>
                <td>${client.process}</td>
                <td>${client.court}</td>
                <td><span class="badge ${getBadgeClass(client.status)}">${client.status}</span></td>
            `;
            tbody.appendChild(tr);
        });
    });

    // 2. Tabela Completa da Aba Clientes
    const fullBody = document.getElementById('fullClientsTableBody');
    if (fullBody) {
        fullBody.innerHTML = '';
        clientsDatabase.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${c.code}</strong></td>
                <td>${c.name}</td>
                <td>${c.cpf}</td>
                <td>${c.age}</td>
                <td>${c.phone}</td>
                <td>${c.email}</td>
                <td style="text-align: center;">
                    <button onclick="editClient('${c.code}')" style="background:none; border:none; color:var(--accent); cursor:pointer; margin-right:12px;" title="Editar"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="deleteClient('${c.code}')" style="background:none; border:none; color:var(--danger); cursor:pointer;" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            fullBody.appendChild(tr);
        });
    }

    // 3. Tabela de Processos
    const procBody = document.getElementById('processesTableBody');
    if (procBody) {
        procBody.innerHTML = '';
        clientsDatabase.forEach(c => {
            procBody.innerHTML += `
                <tr>
                    <td><strong>${c.process}</strong></td>
                    <td>${c.name}</td>
                    <td>${c.type}</td>
                    <td>${c.court}</td>
                    <td><span class="badge ${getBadgeClass(c.status)}">${c.status}</span></td>
                </tr>
            `;
        });
    }

    // 4. Timeline de Prazos
    const deadContainer = document.getElementById('deadlinesContainer');
    if (deadContainer) {
        deadContainer.innerHTML = '';
        clientsDatabase.forEach(c => {
            deadContainer.innerHTML += `
                <div class="timeline-item">
                    <div>
                        <div class="timeline-date"><i class="fa-regular fa-clock"></i> ${c.deadline}</div>
                        <div style="font-weight: 600; margin-top: 4px; color: var(--text-main);">Cliente: ${c.name} (${c.code})</div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">Processo: ${c.process}</div>
                    </div>
                    <span class="badge ${getBadgeClass(c.status)}">${c.status}</span>
                </div>
            `;
        });
    }

    // 5. Tabela Financeira
    const finBody = document.getElementById('financialTableBody');
    if (finBody) {
        finBody.innerHTML = '';
        clientsDatabase.forEach(c => {
            finBody.innerHTML += `
                <tr>
                    <td><strong>${c.name}</strong></td>
                    <td>Ação ${c.type}</td>
                    <td><strong>${c.fee || 'R$ 3.500,00'}</strong></td>
                    <td>20/11/2026</td>
                    <td><span class="badge ${getBadgeClass(c.feeStatus || 'Pendente')}">${c.feeStatus || 'Pendente'}</span></td>
                </tr>
            `;
        });
    }

    renderProfile();
}

// Preencher campos da Dashboard
function fillFormWithClient(client) {
    document.getElementById('fieldCode').value = client.code;
    document.getElementById('fieldName').value = client.name;
    document.getElementById('fieldCpf').value = client.cpf;
    document.getElementById('fieldAge').value = client.age;
    document.getElementById('fieldProcess').value = client.process;
    document.getElementById('fieldType').value = client.type;
    document.getElementById('fieldCourt').value = client.court;
    document.getElementById('fieldPhone').value = client.phone || '';
    document.getElementById('fieldEmail').value = client.email || '';
    document.getElementById('fieldDeadline').value = client.deadline || '';
    
    const statusElem = document.getElementById('fieldStatus');
    statusElem.textContent = client.status;
    statusElem.className = `badge ${getBadgeClass(client.status)}`;

    if (suggestionsList) suggestionsList.style.display = 'none';
    if (searchInput) searchInput.value = client.name;
}

// Limpar Ficha do Cliente
function resetForm() {
    document.getElementById('fieldCode').value = '';
    document.getElementById('fieldName').value = '';
    document.getElementById('fieldCpf').value = '';
    document.getElementById('fieldAge').value = '';
    document.getElementById('fieldProcess').value = '';
    document.getElementById('fieldType').value = '';
    document.getElementById('fieldCourt').value = '';
    document.getElementById('fieldPhone').value = '';
    document.getElementById('fieldEmail').value = '';
    document.getElementById('fieldDeadline').value = '';
    
    const statusElem = document.getElementById('fieldStatus');
    statusElem.textContent = 'Aguardando Seleção';
    statusElem.className = 'badge badge-pending';

    if (searchInput) searchInput.value = '';
}

// Editar e Deletar
function editClient(code) {
    const client = clientsDatabase.find(c => c.code === code);
    if (client) {
        switchTab('painel', document.querySelectorAll('.nav-link')[0]);
        fillFormWithClient(client);
    }
}

function deleteClient(code) {
    if (confirm(`Deseja realmente remover o cliente ${code}?`)) {
        clientsDatabase = clientsDatabase.filter(c => c.code !== code);
        saveData();
        renderAll();
        resetForm();
    }
}

// Busca Rápida Autocomplete
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query.length === 0) {
            suggestionsList.style.display = 'none';
            return;
        }

        const matches = clientsDatabase.filter(c => 
            c.name.toLowerCase().includes(query) || 
            c.cpf.includes(query) || 
            c.code.toLowerCase().includes(query)
        );

        if (matches.length > 0) {
            suggestionsList.innerHTML = '';
            matches.forEach(match => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.innerHTML = `
                    <div class="suggestion-info">
                        <div class="client-name">${match.name}</div>
                        <div class="client-meta">CPF: ${match.cpf} | Proc: ${match.process}</div>
                    </div>
                    <span class="badge ${getBadgeClass(match.status)}">${match.code}</span>
                `;
                div.onclick = () => fillFormWithClient(match);
                suggestionsList.appendChild(div);
            });
            suggestionsList.style.display = 'block';
        } else {
            suggestionsList.style.display = 'none';
        }
    });
}

// Ocultar busca ao clicar fora
document.addEventListener('click', (e) => {
    if (searchInput && suggestionsList) {
        if (!searchInput.contains(e.target) && !suggestionsList.contains(e.target)) {
            suggestionsList.style.display = 'none';
        }
    }
});

// Modal de Cadastrar Cliente
const modalOverlay = document.getElementById('modalOverlay');
const btnOpenModal = document.getElementById('btnOpenModal');
const btnCloseModal = document.getElementById('btnCloseModal');
const btnCancelModal = document.getElementById('btnCancelModal');
const newClientForm = document.getElementById('newClientForm');

const closeModal = () => modalOverlay.classList.remove('active');

if (btnOpenModal) btnOpenModal.onclick = () => modalOverlay.classList.add('active');
if (btnCloseModal) btnCloseModal.onclick = closeModal;
if (btnCancelModal) btnCancelModal.onclick = closeModal;

if (newClientForm) {
    newClientForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newCode = `CLI-${1001 + clientsDatabase.length}`;
        const newClient = {
            code: newCode,
            name: document.getElementById('newFormName').value,
            cpf: document.getElementById('newFormCpf').value,
            age: document.getElementById('newFormAge').value,
            process: document.getElementById('newFormProcess').value || '0000000-00.0000.0.00.0000',
            type: document.getElementById('newFormType').value || 'Geral',
            court: document.getElementById('newFormCourt').value || 'Não Informada',
            status: document.getElementById('newFormStatus').value,
            phone: document.getElementById('newFormPhone').value,
            email: 'cliente@email.com',
            deadline: '15 Dias - Manifestação Inicial',
            fee: 'R$ 4.000,00',
            feeStatus: 'Pendente'
        };

        clientsDatabase.unshift(newClient);
        saveData();
        renderAll();
        fillFormWithClient(newClient);
        
        newClientForm.reset();
        closeModal();
        switchTab('painel', document.querySelectorAll('.nav-link')[0]);
    });
}

// Modal do Perfil da Conta
const profileModalOverlay = document.getElementById('profileModalOverlay');

function openProfileModal() {
    document.getElementById('profileName').value = userProfile.name;
    document.getElementById('profileOab').value = userProfile.oab;
    document.getElementById('profileEmail').value = userProfile.email || '';
    document.getElementById('profilePhone').value = userProfile.phone || '';
    profileModalOverlay.classList.add('active');
}

function closeProfileModal() {
    profileModalOverlay.classList.remove('active');
}

function saveProfile(e) {
    e.preventDefault();
    userProfile.name = document.getElementById('profileName').value;
    userProfile.oab = document.getElementById('profileOab').value;
    userProfile.email = document.getElementById('profileEmail').value;
    userProfile.phone = document.getElementById('profilePhone').value;

    saveProfileData();
    renderProfile();
    closeProfileModal();
}

function renderProfile() {
    document.getElementById('sidebarName').textContent = userProfile.name;
    document.getElementById('sidebarOab').textContent = userProfile.oab;
    
    // Gerar Iniciais para o Avatar (Ex: Dr. Ricardo Alves -> DR)
    const initials = userProfile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    document.getElementById('sidebarAvatar').textContent = initials || 'DR';
}

// Inicializar Dados
renderAll();