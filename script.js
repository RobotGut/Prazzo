/* =========================================================
   PRAZZO - SISTEMA DE GESTÃO JURÍDICA
   Dados locais + Importação + Exportação + Compartilhamento
   ========================================================= */


/* =========================================================
   1. BANCO DE DADOS PADRÃO
   ========================================================= */

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

const defaultProfile = {
    name: 'Dr. Ricardo Alves',
    oab: 'OAB/SP 452.890',
    phone: '(11) 99999-8888',
    email: 'ricardo.alves@jusgestao.com'
};


/* =========================================================
   2. CARREGAMENTO DOS DADOS
   ========================================================= */

function loadClients() {
    try {
        const saved = localStorage.getItem('jusgestao_clientes');

        if (!saved) {
            return [...defaultDatabase];
        }

        const parsed = JSON.parse(saved);

        return Array.isArray(parsed)
            ? parsed
            : [...defaultDatabase];

    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        return [...defaultDatabase];
    }
}

function loadProfile() {
    const savedProfile = localStorage.getItem('jusgestao_perfil');

    if (savedProfile) {
        try {
            userProfile = {
                ...defaultProfile,
                ...JSON.parse(savedProfile)
            };
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
            userProfile = { ...defaultProfile };
        }
    } else {
        userProfile = {
            name: '',
            oab: '',
            phone: '',
            email: ''
        };
    }
}

let clientsDatabase = loadClients();
let userProfile = loadProfile();


function saveData() {
    localStorage.setItem(
        'jusgestao_clientes',
        JSON.stringify(clientsDatabase)
    );
}

function saveProfileData() {
    localStorage.setItem(
        'jusgestao_perfil',
        JSON.stringify(userProfile)
    );
}


/* =========================================================
   3. PERFIL
   ========================================================= */

function renderProfile() {
    const sidebarName = document.getElementById('sidebarName');
    const sidebarOab = document.getElementById('sidebarOab');
    const sidebarAvatar = document.getElementById('sidebarAvatar');

    if (sidebarName) {
        sidebarName.textContent = userProfile.name || '';
    }

    if (sidebarOab) {
        sidebarOab.textContent = userProfile.oab || '';
    }

    if (sidebarAvatar && userProfile.name) {
        const initials = userProfile.name
            .split(' ')
            .filter(Boolean)
            .map(word => word[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

        sidebarAvatar.textContent = initials || 'DR';
    }
}

function openProfileModal() {
    const modal = document.getElementById('profileModalOverlay');

    if (!modal) return;

    document.getElementById('profileName').value =
        userProfile.name || '';

    document.getElementById('profileOab').value =
        userProfile.oab || '';

    document.getElementById('profilePhone').value =
        userProfile.phone || '';

    document.getElementById('profileEmail').value =
        userProfile.email || '';

    modal.classList.add('active');
}

function closeProfileModal() {
    const modal = document.getElementById('profileModalOverlay');

    if (modal) {
        modal.classList.remove('active');
    }
}

function saveProfile(event) {
    event.preventDefault();

    userProfile.name =
        document.getElementById('profileName').value.trim();

    userProfile.oab =
        document.getElementById('profileOab').value.trim();

    userProfile.phone =
        document.getElementById('profilePhone').value.trim();

    userProfile.email =
        document.getElementById('profileEmail').value.trim();

    saveProfileData();
    renderProfile();
    closeProfileModal();

    alert('Perfil atualizado com sucesso.');
}


/* =========================================================
   4. NAVEGAÇÃO
   ========================================================= */

const pageTitles = {
    painel: {
        title: 'Gestão Integrada de Clientes',
        sub: 'Consulte, organize e gerencie fichas jurídicas e processos em tempo real.'
    },
    clientes: {
        title: 'Base Completa de Clientes',
        sub: 'Gerenciamento e histórico dos clientes cadastrados.'
    },
    processos: {
        title: 'Andamento de Processos',
        sub: 'Status, varas e acompanhamento de ações judiciais.'
    },
    prazos: {
        title: 'Controle de Prazos e Audiências',
        sub: 'Próximos compromissos e audiências agendadas.'
    },
    financeiro: {
        title: 'Gestão Financeira & Honorários',
        sub: 'Acompanhamento de faturamento, liquidações e honorários.'
    },
    documentos: {
        title: 'Modelos e Documentos Vinculados',
        sub: 'Download de minutas e documentos padrão.'
    }
};

function switchTab(tabId, element) {
    document
        .querySelectorAll('.nav-link')
        .forEach(nav => nav.classList.remove('active'));

    if (element) {
        element.classList.add('active');
    }

    document
        .querySelectorAll('.tab-content')
        .forEach(tab => tab.classList.remove('active'));

    const targetTab = document.getElementById(`tab-${tabId}`);

    if (targetTab) {
        targetTab.classList.add('active');
    }

    if (pageTitles[tabId]) {
        const title = document.getElementById('pageTitle');
        const subtitle = document.getElementById('pageSubtitle');

        if (title) {
            title.textContent = pageTitles[tabId].title;
        }

        if (subtitle) {
            subtitle.textContent = pageTitles[tabId].sub;
        }
    }
}


/* =========================================================
   5. SEGURANÇA PARA HTML
   ========================================================= */

function escapeHTML(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


/* =========================================================
   6. BADGES
   ========================================================= */

function getBadgeClass(status) {
    if (
        status === 'Em Andamento' ||
        status === 'Recebido'
    ) {
        return 'badge-active';
    }

    if (
        status === 'Aguardando Prazo' ||
        status === 'Pendente'
    ) {
        return 'badge-pending';
    }

    return 'badge-closed';
}


/* =========================================================
   7. RENDERIZAÇÃO GERAL
   ========================================================= */

function renderAll() {
    renderDashboardTable();
    renderClientsTable();
    renderProcessesTable();
    renderDeadlines();
    renderFinancialTable();
    updateFinancialSummary();
    renderProfile();
}


/* =========================================================
   8. TABELA DO PAINEL
   ========================================================= */

function renderDashboardTable() {
    document
        .querySelectorAll('.clientsTableBody')
        .forEach(tbody => {

            tbody.innerHTML = '';

            clientsDatabase.forEach(client => {

                const tr = document.createElement('tr');

                tr.style.cursor = 'pointer';

                tr.addEventListener('click', () => {
                    const painelLink =
                        document.querySelector('.nav-link');

                    switchTab('painel', painelLink);
                    fillFormWithClient(client);
                });

                tr.innerHTML = `
                    <td>
                        <strong>${escapeHTML(client.code)}</strong>
                    </td>

                    <td>
                        ${escapeHTML(client.name)}
                    </td>

                    <td>
                        ${escapeHTML(client.cpf)}
                    </td>

                    <td>
                        ${escapeHTML(client.process)}
                    </td>

                    <td>
                        ${escapeHTML(client.court)}
                    </td>

                    <td>
                        <span class="badge ${getBadgeClass(client.status)}">
                            ${escapeHTML(client.status)}
                        </span>
                    </td>
                `;

                tbody.appendChild(tr);
            });
        });
}


/* =========================================================
   9. TABELA DE CLIENTES
   ========================================================= */

function renderClientsTable() {
    const body = document.getElementById(
        'fullClientsTableBody'
    );

    if (!body) return;

    body.innerHTML = '';

    clientsDatabase.forEach(client => {

        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>
                <strong>${escapeHTML(client.code)}</strong>
            </td>

            <td>
                ${escapeHTML(client.name)}
            </td>

            <td>
                ${escapeHTML(client.cpf)}
            </td>

            <td>
                ${escapeHTML(client.age)}
            </td>

            <td>
                ${escapeHTML(client.phone)}
            </td>

            <td>
                ${escapeHTML(client.email)}
            </td>

            <td style="text-align:center;">

                <button
                    type="button"
                    onclick="editClient('${escapeHTML(client.code)}')"
                    style="background:none;border:none;color:var(--accent);cursor:pointer;margin-right:12px;"
                    title="Editar"
                >
                    <i class="fa-solid fa-pen"></i>
                </button>

                <button
                    type="button"
                    onclick="deleteClient('${escapeHTML(client.code)}')"
                    style="background:none;border:none;color:var(--danger);cursor:pointer;"
                    title="Excluir"
                >
                    <i class="fa-solid fa-trash"></i>
                </button>

            </td>
        `;

        body.appendChild(tr);
    });
}


/* =========================================================
   10. TABELA DE PROCESSOS
   ========================================================= */

function renderProcessesTable() {
    const body = document.getElementById(
        'processesTableBody'
    );

    if (!body) return;

    body.innerHTML = '';

    clientsDatabase.forEach(client => {

        body.innerHTML += `
            <tr>

                <td>
                    <strong>
                        ${escapeHTML(client.process)}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(client.name)}
                </td>

                <td>
                    ${escapeHTML(client.type)}
                </td>

                <td>
                    ${escapeHTML(client.court)}
                </td>

                <td>
                    <span class="badge ${getBadgeClass(client.status)}">
                        ${escapeHTML(client.status)}
                    </span>
                </td>

            </tr>
        `;
    });
}


/* =========================================================
   11. PRAZOS
   ========================================================= */

function renderDeadlines() {
    const container =
        document.getElementById('deadlinesContainer');

    if (!container) return;

    container.innerHTML = '';

    clientsDatabase.forEach(client => {

        container.innerHTML += `
            <div class="timeline-item">

                <div>

                    <div class="timeline-date">
                        <i class="fa-regular fa-clock"></i>
                        ${escapeHTML(client.deadline)}
                    </div>

                    <div
                        style="font-weight:600;margin-top:4px;color:var(--text-main);"
                    >
                        Cliente:
                        ${escapeHTML(client.name)}
                        (${escapeHTML(client.code)})
                    </div>

                    <div
                        style="font-size:0.85rem;color:var(--text-muted);"
                    >
                        Processo:
                        ${escapeHTML(client.process)}
                    </div>

                </div>

                <span class="badge ${getBadgeClass(client.status)}">
                    ${escapeHTML(client.status)}
                </span>

            </div>
        `;
    });
}


/* =========================================================
   12. FINANCEIRO
   ========================================================= */

function moneyToNumber(value) {
    if (!value) return 0;

    const normalized = String(value)
        .replace(/[^\d,.-]/g, '')
        .replace(/\./g, '')
        .replace(',', '.');

    const number = parseFloat(normalized);

    return Number.isFinite(number)
        ? number
        : 0;
}

function formatCurrency(value) {
    return new Intl.NumberFormat(
        'pt-BR',
        {
            style: 'currency',
            currency: 'BRL'
        }
    ).format(value);
}

function renderFinancialTable() {
    const body =
        document.getElementById('financialTableBody');

    if (!body) return;

    body.innerHTML = '';

    clientsDatabase.forEach(client => {

        body.innerHTML += `
            <tr>

                <td>
                    <strong>
                        ${escapeHTML(client.name)}
                    </strong>
                </td>

                <td>
                    Ação ${escapeHTML(client.type)}
                </td>

                <td>
                    <strong>
                        ${escapeHTML(client.fee || 'R$ 0,00')}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(
                        client.deadline || 'Não informado'
                    )}
                </td>

                <td>
                    <span class="badge ${getBadgeClass(
                        client.feeStatus || 'Pendente'
                    )}">
                        ${escapeHTML(
                            client.feeStatus || 'Pendente'
                        )}
                    </span>
                </td>

            </tr>
        `;
    });
}

function updateFinancialSummary() {
    const pendingElement =
        document.getElementById('totalPendingFee');

    const receivedElement =
        document.getElementById('totalReceivedFee');

    const contractsElement =
        document.getElementById('activeContractsCount');

    let pending = 0;
    let received = 0;

    clientsDatabase.forEach(client => {

        const value = moneyToNumber(client.fee);

        if (client.feeStatus === 'Recebido') {
            received += value;
        } else {
            pending += value;
        }
    });

    if (pendingElement) {
        pendingElement.textContent =
            formatCurrency(pending);
    }

    if (receivedElement) {
        receivedElement.textContent =
            formatCurrency(received);
    }

    if (contractsElement) {
        contractsElement.textContent =
            clientsDatabase.length;
    }
}


/* =========================================================
   13. FICHA DO CLIENTE
   ========================================================= */

function fillFormWithClient(client) {
    const fields = {
        fieldCode: client.code,
        fieldName: client.name,
        fieldCpf: client.cpf,
        fieldAge: client.age,
        fieldProcess: client.process,
        fieldType: client.type,
        fieldCourt: client.court,
        fieldPhone: client.phone || '',
        fieldEmail: client.email || '',
        fieldDeadline: client.deadline || ''
    };

    Object.entries(fields).forEach(([id, value]) => {

        const element = document.getElementById(id);

        if (element) {
            element.value = value;
        }
    });

    const statusElement =
        document.getElementById('fieldStatus');

    if (statusElement) {
        statusElement.textContent =
            client.status || 'Aguardando Seleção';

        statusElement.className =
            `badge ${getBadgeClass(client.status)}`;
    }

    const suggestions =
        document.getElementById('suggestionsList');

    const search =
        document.getElementById('clientSearch');

    if (suggestions) {
        suggestions.style.display = 'none';
    }

    if (search) {
        search.value = client.name;
    }
}

function resetForm() {
    const ids = [
        'fieldCode',
        'fieldName',
        'fieldCpf',
        'fieldAge',
        'fieldProcess',
        'fieldType',
        'fieldCourt',
        'fieldPhone',
        'fieldEmail',
        'fieldDeadline'
    ];

    ids.forEach(id => {

        const element = document.getElementById(id);

        if (element) {
            element.value = '';
        }
    });

    const status =
        document.getElementById('fieldStatus');

    if (status) {
        status.textContent =
            'Aguardando Seleção';

        status.className =
            'badge badge-pending';
    }

    const search =
        document.getElementById('clientSearch');

    if (search) {
        search.value = '';
    }
}


/* =========================================================
   14. EDITAR / EXCLUIR
   ========================================================= */

function editClient(code) {
    const client =
        clientsDatabase.find(item => item.code === code);

    if (!client) return;

    const painelLink =
        document.querySelector('.nav-link');

    switchTab('painel', painelLink);

    fillFormWithClient(client);
}

function deleteClient(code) {
    const client =
        clientsDatabase.find(item => item.code === code);

    if (!client) return;

    const confirmed = confirm(
        `Deseja realmente remover o cliente ${client.name} (${code})?`
    );

    if (!confirmed) return;

    clientsDatabase =
        clientsDatabase.filter(item => item.code !== code);

    saveData();
    renderAll();
    resetForm();
}


/* =========================================================
   15. AUTOCOMPLETE
   ========================================================= */

function setupSearch() {
    const searchInput =
        document.getElementById('clientSearch');

    const suggestionsList =
        document.getElementById('suggestionsList');

    if (!searchInput || !suggestionsList) return;

    searchInput.addEventListener('input', event => {

        const query =
            event.target.value
                .toLowerCase()
                .trim();

        if (!query) {
            suggestionsList.style.display = 'none';
            return;
        }

        const matches =
            clientsDatabase.filter(client => {

                return (
                    String(client.name)
                        .toLowerCase()
                        .includes(query) ||

                    String(client.cpf)
                        .toLowerCase()
                        .includes(query) ||

                    String(client.code)
                        .toLowerCase()
                        .includes(query)
                );
            });

        if (!matches.length) {
            suggestionsList.style.display = 'none';
            return;
        }

        suggestionsList.innerHTML = '';

        matches.forEach(client => {

            const div =
                document.createElement('div');

            div.className =
                'suggestion-item';

            div.innerHTML = `
                <div class="suggestion-info">

                    <div class="client-name">
                        ${escapeHTML(client.name)}
                    </div>

                    <div class="client-meta">
                        CPF: ${escapeHTML(client.cpf)}
                        |
                        Proc: ${escapeHTML(client.process)}
                    </div>

                </div>

                <span class="badge ${getBadgeClass(client.status)}">
                    ${escapeHTML(client.code)}
                </span>
            `;

            div.addEventListener('click', () => {
                fillFormWithClient(client);
            });

            suggestionsList.appendChild(div);
        });

        suggestionsList.style.display = 'block';
    });

    document.addEventListener('click', event => {

        if (
            !searchInput.contains(event.target) &&
            !suggestionsList.contains(event.target)
        ) {
            suggestionsList.style.display = 'none';
        }
    });
}


/* =========================================================
   16. MODAL NOVO CLIENTE
   ========================================================= */

function setupNewClientModal() {
    const modal =
        document.getElementById('modalOverlay');

    const openButton =
        document.getElementById('btnOpenModal');

    const closeButton =
        document.getElementById('btnCloseModal');

    const cancelButton =
        document.getElementById('btnCancelModal');

    const form =
        document.getElementById('newClientForm');

    if (!modal || !form) return;

    const closeModal = () => {
        modal.classList.remove('active');
    };

    if (openButton) {
        openButton.addEventListener('click', () => {
            modal.classList.add('active');
        });
    }

    if (closeButton) {
        closeButton.addEventListener(
            'click',
            closeModal
        );
    }

    if (cancelButton) {
        cancelButton.addEventListener(
            'click',
            closeModal
        );
    }

    form.addEventListener('submit', event => {

        event.preventDefault();

        const name =
            document.getElementById('newFormName').value.trim();

        const cpf =
            document.getElementById('newFormCpf').value.trim();

        const age =
            document.getElementById('newFormAge').value.trim();

        const phone =
            document.getElementById('newFormPhone').value.trim();

        if (!name || !cpf || !age || !phone) {
            alert('Preencha todos os campos obrigatórios.');
            return;
        }

        const numbers = clientsDatabase
            .map(client => {
                const match =
                    String(client.code).match(/CLI-(\d+)/);

                return match
                    ? Number(match[1])
                    : 1000;
            });

        const nextNumber =
            Math.max(1000, ...numbers) + 1;

        const newClient = {

            code: `CLI-${nextNumber}`,

            name,

            cpf,

            age,

            process:
                document.getElementById('newFormProcess').value.trim()
                || '0000000-00.0000.0.00.0000',

            type:
                document.getElementById('newFormType').value.trim()
                || 'Geral',

            court:
                document.getElementById('newFormCourt').value.trim()
                || 'Não Informada',

            status:
                document.getElementById('newFormStatus').value,

            phone,

            email:
                document.getElementById('newFormEmail').value.trim()
                || '',

            deadline:
                'A definir',

            fee:
                document.getElementById('newFormFee').value.trim()
                || 'R$ 0,00',

            feeStatus:
                'Pendente'
        };

        clientsDatabase.unshift(newClient);

        saveData();
        renderAll();
        fillFormWithClient(newClient);

        form.reset();

        closeModal();

        switchTab(
            'painel',
            document.querySelector('.nav-link')
        );

        alert(
            `Cliente ${newClient.code} cadastrado com sucesso.`
        );
    });
}


/* =========================================================
   17. MODAL DE EXPORTAÇÃO
   ========================================================= */

function openExportModal() {
    const modal =
        document.getElementById('exportModalOverlay');

    if (modal) {
        modal.classList.add('active');
    }
}

function closeExportModal() {
    const modal =
        document.getElementById('exportModalOverlay');

    if (modal) {
        modal.classList.remove('active');
    }
}


/* =========================================================
   18. GERAR BACKUP
   ========================================================= */

function createBackupObject() {
    return {
        app: 'Prazzo',
        version: '1.0',
        exportedAt: new Date().toISOString(),
        profile: userProfile,
        clients: clientsDatabase
    };
}

function createBackupJSON() {
    return JSON.stringify(
        createBackupObject(),
        null,
        2
    );
}

function downloadFile(content, filename, type) {
    const blob =
        new Blob([content], { type });

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement('a');

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
}


/* =========================================================
   19. EXPORTAR JSON
   ========================================================= */

function exportData() {
    const json =
        createBackupJSON();

    const date =
        new Date()
            .toISOString()
            .slice(0, 10);

    downloadFile(
        json,
        `prazzo-backup-${date}.json`,
        'application/json;charset=utf-8'
    );

    alert(
        'Backup JSON exportado com sucesso.'
    );
}


/* =========================================================
   20. EXPORTAR CSV
   ========================================================= */

function csvEscape(value) {
    const text =
        String(value ?? '');

    return `"${text.replace(/"/g, '""')}"`;
}

function exportCSV() {
    const headers = [
        'Código',
        'Nome',
        'CPF',
        'Idade',
        'Processo',
        'Tipo',
        'Vara/Tribunal',
        'Status',
        'Telefone',
        'E-mail',
        'Prazo',
        'Honorários',
        'Status Honorários'
    ];

    const rows = clientsDatabase.map(client => [

        client.code,
        client.name,
        client.cpf,
        client.age,
        client.process,
        client.type,
        client.court,
        client.status,
        client.phone,
        client.email,
        client.deadline,
        client.fee,
        client.feeStatus

    ]);

    const csv = [
        headers,
        ...rows
    ]
        .map(row =>
            row.map(csvEscape).join(';')
        )
        .join('\r\n');

    const content =
        '\uFEFF' + csv;

    const date =
        new Date()
            .toISOString()
            .slice(0, 10);

    downloadFile(
        content,
        `prazzo-clientes-${date}.csv`,
        'text/csv;charset=utf-8'
    );

    alert(
        'Arquivo CSV exportado com sucesso.'
    );
}


/* =========================================================
   21. COMPARTILHAMENTO NATIVO
   ========================================================= */

async function shareData() {
    const json =
        createBackupJSON();

    const blob =
        new Blob(
            [json],
            { type: 'application/json' }
        );

    const date =
        new Date()
            .toISOString()
            .slice(0, 10);

    const filename =
        `prazzo-backup-${date}.json`;

    try {

        if (
            navigator.share &&
            typeof File !== 'undefined'
        ) {

            const file =
                new File(
                    [blob],
                    filename,
                    {
                        type: 'application/json'
                    }
                );

            if (
                !navigator.canShare ||
                navigator.canShare({ files: [file] })
            ) {

                await navigator.share({
                    title: 'Backup do Prazzo',
                    text: 'Backup dos dados do Prazzo.',
                    files: [file]
                });

                return;
            }
        }

        if (navigator.share) {

            await navigator.share({
                title: 'Prazzo',
                text:
                    'Backup do Prazzo com ' +
                    clientsDatabase.length +
                    ' cliente(s).'
            });

            return;
        }

        alert(
            'O compartilhamento nativo não é suportado neste navegador. Use a opção de Backup JSON.'
        );

    } catch (error) {

        if (error.name !== 'AbortError') {

            console.error(
                'Erro ao compartilhar:',
                error
            );

            alert(
                'Não foi possível compartilhar automaticamente.'
            );
        }
    }
}


/* =========================================================
   22. PREPARAR E-MAIL
   ========================================================= */

function sendByEmail() {
    const subject =
        encodeURIComponent(
            `Backup do Prazzo - ${new Date().toLocaleDateString('pt-BR')}`
        );

    const body =
        encodeURIComponent(
            `Olá,

Segue o backup do sistema Prazzo.

Quantidade de clientes: ${clientsDatabase.length}

O arquivo JSON pode ser exportado pelo próprio sistema através da opção "Backup JSON".

Atenciosamente,
${userProfile.name || 'Usuário Prazzo'}
${userProfile.oab || ''}`
        );

    window.location.href =
        `mailto:?subject=${subject}&body=${body}`;
}


/* =========================================================
   23. COPIAR DADOS
   ========================================================= */

async function copyDataToClipboard() {
    const json =
        createBackupJSON();

    try {

        await navigator.clipboard.writeText(json);

        alert(
            'Dados copiados para a área de transferência.'
        );

    } catch (error) {

        console.error(
            'Erro ao copiar:',
            error
        );

        const textarea =
            document.createElement('textarea');

        textarea.value = json;

        document.body.appendChild(textarea);

        textarea.select();

        document.execCommand('copy');

        textarea.remove();

        alert(
            'Dados copiados para a área de transferência.'
        );
    }
}


/* =========================================================
   24. RELATÓRIO PARA IMPRESSÃO / PDF
   ========================================================= */

function printReport() {
    const date =
        new Date()
            .toLocaleString('pt-BR');

    const rows =
        clientsDatabase
            .map(client => `
                <tr>
                    <td>${escapeHTML(client.code)}</td>
                    <td>${escapeHTML(client.name)}</td>
                    <td>${escapeHTML(client.cpf)}</td>
                    <td>${escapeHTML(client.process)}</td>
                    <td>${escapeHTML(client.type)}</td>
                    <td>${escapeHTML(client.status)}</td>
                    <td>${escapeHTML(client.fee)}</td>
                </tr>
            `)
            .join('');

    const report = `
        <!DOCTYPE html>

        <html lang="pt-BR">

        <head>

            <meta charset="UTF-8">

            <title>Relatório - Prazzo</title>

            <style>

                * {
                    box-sizing: border-box;
                }

                body {
                    font-family: Arial, sans-serif;
                    margin: 40px;
                    color: #111827;
                }

                h1 {
                    margin-bottom: 5px;
                }

                .subtitle {
                    color: #64748b;
                    margin-bottom: 25px;
                }

                .info {
                    margin-bottom: 25px;
                    line-height: 1.7;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 12px;
                }

                th,
                td {
                    border: 1px solid #d1d5db;
                    padding: 8px;
                    text-align: left;
                }

                th {
                    background: #f1f5f9;
                }

                .footer {
                    margin-top: 30px;
                    font-size: 11px;
                    color: #64748b;
                }

                @media print {

                    body {
                        margin: 20px;
                    }

                    button {
                        display: none;
                    }

                }

            </style>

        </head>

        <body>

            <h1>Prazzo</h1>

            <div class="subtitle">
                Relatório de Gestão Jurídica
            </div>

            <div class="info">

                <strong>Advogado:</strong>
                ${escapeHTML(userProfile.name)}

                <br>

                <strong>OAB:</strong>
                ${escapeHTML(userProfile.oab)}

                <br>

                <strong>Clientes cadastrados:</strong>
                ${clientsDatabase.length}

                <br>

                <strong>Gerado em:</strong>
                ${date}

            </div>

            <table>

                <thead>

                    <tr>
                        <th>Código</th>
                        <th>Cliente</th>
                        <th>CPF</th>
                        <th>Processo</th>
                        <th>Tipo</th>
                        <th>Status</th>
                        <th>Honorários</th>
                    </tr>

                </thead>

                <tbody>

                    ${rows}

                </tbody>

            </table>

            <div class="footer">
                Documento gerado pelo sistema Prazzo.
            </div>

            <script>
                window.onload = function() {
                    window.print();
                };
            <\/script>

        </body>

        </html>
    `;

    const reportWindow =
        window.open(
            '',
            '_blank',
            'width=1200,height=800'
        );

    if (!reportWindow) {

        alert(
            'O navegador bloqueou a janela de impressão. Permita pop-ups para o Prazzo.'
        );

        return;
    }

    reportWindow.document.open();
    reportWindow.document.write(report);
    reportWindow.document.close();
}


/* =========================================================
   25. IMPORTAR BACKUP
   ========================================================= */

function setupImport() {
    const input =
        document.getElementById('importFile');

    if (!input) return;

    input.addEventListener('change', event => {

        const file =
            event.target.files[0];

        if (!file) return;

        const reader =
            new FileReader();

        reader.onload = function(loadEvent) {

            try {

                const backup =
                    JSON.parse(
                        loadEvent.target.result
                    );

                if (
                    !backup ||
                    !Array.isArray(backup.clients)
                ) {

                    throw new Error(
                        'Formato de backup inválido.'
                    );
                }

                const confirmed =
                    confirm(
                        'Importar este backup substituirá os dados atuais deste dispositivo. Deseja continuar?'
                    );

                if (!confirmed) {
                    input.value = '';
                    return;
                }

                clientsDatabase =
                    backup.clients;

                if (
                    backup.profile &&
                    typeof backup.profile === 'object'
                ) {

                    userProfile = {
                        ...defaultProfile,
                        ...backup.profile
                    };
                }

                saveData();
                saveProfileData();

                renderAll();
                resetForm();

                alert(
                    `Backup importado com sucesso.\n\n${clientsDatabase.length} cliente(s) restaurado(s).`
                );

                closeExportModal();

            } catch (error) {

                console.error(
                    'Erro ao importar backup:',
                    error
                );

                alert(
                    'Não foi possível importar o arquivo. Verifique se ele é um backup JSON válido do Prazzo.'
                );

            } finally {

                input.value = '';
            }
        };

        reader.readAsText(file);
    });
}


/* =========================================================
   26. FECHAR MODAIS CLICANDO FORA
   ========================================================= */

function setupModalClosing() {

    document.addEventListener('click', event => {

        const modalIds = [
            'modalOverlay',
            'profileModalOverlay',
            'exportModalOverlay'
        ];

        modalIds.forEach(id => {

            const modal =
                document.getElementById(id);

            if (
                modal &&
                event.target === modal
            ) {
                modal.classList.remove('active');
            }
        });
    });

    document.addEventListener('keydown', event => {

        if (event.key !== 'Escape') {
            return;
        }

        document
            .querySelectorAll('.modal-overlay.active')
            .forEach(modal => {
                modal.classList.remove('active');
            });
    });
}


/* =========================================================
   27. INICIALIZAÇÃO
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    const hasSavedProfile = localStorage.getItem('jusgestao_perfil');

    renderAll();

    setupSearch();

    setupNewClientModal();

    setupImport();

    setupModalClosing();

    if (!hasSavedProfile) {
        setTimeout(() => {
            openProfileModal();
        }, 500);
    }

});