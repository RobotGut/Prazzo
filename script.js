/* =========================================================
   PRAZZO - SISTEMA DE GESTÃO JURÍDICA
   Dados locais + Prazos + Calendário + Edição + Modo Escuro
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
        deadline: '18/11/2026 - Contestação',
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
        deadline: '25/11/2026 - Réplica',
        fee: 'R$ 8.500,00',
        feeStatus: 'Pendente'
    }
];

const defaultEvents = [
    {
        id: 'EVT-1001',
        title: 'Reunião de Alinhamento Interno',
        category: 'Reunião',
        date: '2026-11-20',
        time: '14:00',
        clientCode: '',
        clientName: 'Escritório',
        notes: 'Sala de reuniões principal'
    }
];

const defaultProfile = {
    name: 'Dr. Ricardo Alves',
    oab: 'OAB/SP 452.890',
    phone: '(11) 99999-8888',
    email: 'ricardo.alves@jusgestao.com'
};


/* =========================================================
   2. CARREGAMENTO E SALVAMENTO DOS DADOS
   ========================================================= */

function loadClients() {
    try {
        const saved = localStorage.getItem('jusgestao_clientes');
        if (!saved) return [...defaultDatabase];
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [...defaultDatabase];
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        return [...defaultDatabase];
    }
}

function loadCustomEvents() {
    try {
        const saved = localStorage.getItem('jusgestao_eventos');
        if (!saved) return [...defaultEvents];
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [...defaultEvents];
    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
        return [...defaultEvents];
    }
}

function loadProfile() {
    const savedProfile = localStorage.getItem('jusgestao_perfil');
    if (savedProfile) {
        try {
            return { ...defaultProfile, ...JSON.parse(savedProfile) };
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
            return { ...defaultProfile };
        }
    }
    return { ...defaultProfile };
}

let clientsDatabase = loadClients();
let customEventsDatabase = loadCustomEvents();
let userProfile = loadProfile();

let currentClientsFilter = 'ativos';
let currentProcessesFilter = 'ativos';

function saveData() {
    localStorage.setItem('jusgestao_clientes', JSON.stringify(clientsDatabase));
}

function saveCustomEvents() {
    localStorage.setItem('jusgestao_eventos', JSON.stringify(customEventsDatabase));
}

function saveProfileData() {
    localStorage.setItem('jusgestao_perfil', JSON.stringify(userProfile));
}


/* =========================================================
   3. PERFIL DO ADVOGADO & MODO ESCURO
   ========================================================= */

function renderProfile() {
    const sidebarName = document.getElementById('sidebarName');
    const sidebarOab = document.getElementById('sidebarOab');
    const sidebarAvatar = document.getElementById('sidebarAvatar');

    if (sidebarName) sidebarName.textContent = userProfile.name || 'Advogado';
    if (sidebarOab) sidebarOab.textContent = userProfile.oab || 'OAB Pendente';

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

    document.getElementById('profileName').value = userProfile.name || '';
    document.getElementById('profileOab').value = userProfile.oab || '';
    document.getElementById('profilePhone').value = userProfile.phone || '';
    document.getElementById('profileEmail').value = userProfile.email || '';

    modal.classList.add('active');
}

function closeProfileModal() {
    const modal = document.getElementById('profileModalOverlay');
    if (modal) modal.classList.remove('active');
}

function saveProfile(event) {
    event.preventDefault();

    userProfile.name = document.getElementById('profileName').value.trim();
    userProfile.oab = document.getElementById('profileOab').value.trim();
    userProfile.phone = document.getElementById('profilePhone').value.trim();
    userProfile.email = document.getElementById('profileEmail').value.trim();

    saveProfileData();
    renderProfile();
    closeProfileModal();
    alert('Perfil atualizado com sucesso.');
}

function initDarkMode() {
    const savedTheme = localStorage.getItem('prazzo_theme');
    const isDark = savedTheme === 'dark';

    if (isDark) {
        document.body.classList.add('dark-mode');
        updateThemeButtonUI(true);
    } else {
        document.body.classList.remove('dark-mode');
        updateThemeButtonUI(false);
    }
}

function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-mode');
    
    if (isDark) {
        localStorage.setItem('prazzo_theme', 'dark');
        updateThemeButtonUI(true);
    } else {
        localStorage.setItem('prazzo_theme', 'light');
        updateThemeButtonUI(false);
    }

    if (calendarInstance) {
        setTimeout(() => calendarInstance.render(), 50);
    }
}

function updateThemeButtonUI(isDark) {
    const icon = document.getElementById('themeIcon');
    const text = document.getElementById('themeText');

    if (icon && text) {
        if (isDark) {
            icon.className = 'fa-solid fa-sun';
            text.textContent = 'Modo Claro';
        } else {
            icon.className = 'fa-solid fa-moon';
            text.textContent = 'Modo Escuro';
        }
    }
}


/* =========================================================
   4. NAVEGAÇÃO & CONTROLE DA SIDEBAR MOBILE
   ========================================================= */

const pageTitles = {
    painel: {
        title: 'Gestão Integrada de Clientes',
        sub: 'Consulte, organize e gerencie fichas jurídicas e processos em tempo real.'
    },
    clientes: {
        title: 'Base Completa de Clientes',
        sub: 'Gerenciamento e histórico dos clientes cadastrados por status.'
    },
    processos: {
        title: 'Andamento de Processos',
        sub: 'Status, varas e acompanhamento de ações judiciais ativas e encerradas.'
    },
    prazos: {
        title: 'Controle de Prazos e Audiências',
        sub: 'Próximos compromissos e audiências agendadas.'
    },
    calendario: {
        title: 'Calendário de Compromissos',
        sub: 'Visualize e agende audiências, reuniões e prazos no calendário.'
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
    document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active'));

    if (element) {
        element.classList.add('active');
    } else {
        const autoLink = document.querySelector(`.nav-link[data-tab="${tabId}"]`);
        if (autoLink) autoLink.classList.add('active');
    }

    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));

    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) targetTab.classList.add('active');

    if (pageTitles[tabId]) {
        const title = document.getElementById('pageTitle');
        const subtitle = document.getElementById('pageSubtitle');
        if (title) title.textContent = pageTitles[tabId].title;
        if (subtitle) subtitle.textContent = pageTitles[tabId].sub;
    }

    if (tabId === 'calendario') {
        setTimeout(() => {
            if (calendarInstance) {
                calendarInstance.render();
                calendarInstance.updateSize();
            }
        }, 80);
    }

    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar && sidebar.classList.contains('mobile-open')) {
        sidebar.classList.remove('mobile-open');
        if (overlay) overlay.classList.remove('active');
    }
}

function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.toggle('mobile-open');
    if (overlay) overlay.classList.toggle('active');
}


/* =========================================================
   5. SEGURANÇA PARA HTML & UTILS
   ========================================================= */

function escapeHTML(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getBadgeClass(status) {
    if (status === 'Em Andamento' || status === 'Recebido') return 'badge-active';
    if (status === 'Aguardando Prazo' || status === 'Pendente') return 'badge-pending';
    return 'badge-closed';
}

function formatIsoToBrDate(isoDate) {
    if (!isoDate || !isoDate.includes('-')) return isoDate;
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
}

function parseBrDateToIso(brDate) {
    if (!brDate) return null;
    const match = brDate.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (!match) return null;
    return `${match[3]}-${match[2]}-${match[1]}`;
}


/* =========================================================
   6. RENDERIZAÇÃO GERAL
   ========================================================= */

function renderAll() {
    renderDashboardTable();
    renderClientsTable();
    renderProcessesTable();
    renderDeadlines();
    renderCalendar();
    renderFinancialTable();
    updateFinancialSummary();
    renderProfile();
}


/* =========================================================
   7. TABELA DO PAINEL
   ========================================================= */

function renderDashboardTable() {
    document.querySelectorAll('.clientsTableBody').forEach(tbody => {
        tbody.innerHTML = '';

        clientsDatabase.forEach(client => {
            const tr = document.createElement('tr');
            tr.style.cursor = 'pointer';

            tr.addEventListener('click', () => {
                switchTab('painel');
                fillFormWithClient(client);
            });

            tr.innerHTML = `
                <td><strong>${escapeHTML(client.code)}</strong></td>
                <td>${escapeHTML(client.name)}</td>
                <td>${escapeHTML(client.cpf)}</td>
                <td>${escapeHTML(client.process)}</td>
                <td>${escapeHTML(client.court)}</td>
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
   8. ABA CLIENTES & FILTROS (ATIVOS / ENCERRADOS)
   ========================================================= */

function setClientsFilter(filter, btnElement) {
    currentClientsFilter = filter;
    
    const parentBar = btnElement.closest('.filter-tabs-bar');
    if (parentBar) {
        parentBar.querySelectorAll('.filter-tab-btn').forEach(b => b.classList.remove('active'));
    }
    btnElement.classList.add('active');

    renderClientsTable();
}

function renderClientsTable() {
    const body = document.getElementById('fullClientsTableBody');
    const titleEl = document.getElementById('clientsTableTitle');
    if (!body) return;

    body.innerHTML = '';

    let filtered = clientsDatabase;
    if (currentClientsFilter === 'ativos') {
        filtered = clientsDatabase.filter(c => c.status !== 'Encerrado');
        if (titleEl) titleEl.textContent = 'Base de Clientes Ativos';
    } else if (currentClientsFilter === 'encerrados') {
        filtered = clientsDatabase.filter(c => c.status === 'Encerrado');
        if (titleEl) titleEl.textContent = 'Clientes com Processos Finalizados';
    } else {
        if (titleEl) titleEl.textContent = 'Todos os Clientes Cadastrados';
    }

    if (filtered.length === 0) {
        body.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--text-muted); padding:30px;">Nenhum cliente encontrado nesta categoria.</td></tr>`;
        return;
    }

    filtered.forEach(client => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td><strong>${escapeHTML(client.code)}</strong></td>
            <td>${escapeHTML(client.name)}</td>
            <td>${escapeHTML(client.cpf)}</td>
            <td>${escapeHTML(client.age)}</td>
            <td>${escapeHTML(client.phone)}</td>
            <td>${escapeHTML(client.email)}</td>
            <td>
                <span class="badge ${getBadgeClass(client.status)}">
                    ${escapeHTML(client.status)}
                </span>
            </td>
            <td style="text-align:center;">
                <button
                    type="button"
                    onclick="openEditClientModal('${escapeHTML(client.code)}')"
                    style="background:none;border:none;color:var(--accent);cursor:pointer;margin-right:12px;font-size:1rem;"
                    title="Editar Cliente"
                >
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button
                    type="button"
                    onclick="deleteClient('${escapeHTML(client.code)}')"
                    style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:1rem;"
                    title="Excluir Cliente"
                >
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;

        body.appendChild(tr);
    });
}

function openEditClientModal(code) {
    const client = clientsDatabase.find(item => item.code === code);
    if (!client) return;

    document.getElementById('editModalCode').value = client.code;
    document.getElementById('editModalName').value = client.name || '';
    document.getElementById('editModalCpf').value = client.cpf || '';
    document.getElementById('editModalAge').value = client.age || '';
    document.getElementById('editModalPhone').value = client.phone || '';
    document.getElementById('editModalEmail').value = client.email || '';
    document.getElementById('editModalProcess').value = client.process || '';
    document.getElementById('editModalType').value = client.type || '';
    document.getElementById('editModalCourt').value = client.court || '';
    document.getElementById('editModalStatus').value = client.status || 'Em Andamento';
    document.getElementById('editModalDeadline').value = client.deadline || '';
    document.getElementById('editModalFee').value = client.fee || '';
    document.getElementById('editModalFeeStatus').value = client.feeStatus || 'Pendente';

    document.getElementById('editClientModalOverlay').classList.add('active');
}

function closeEditClientModal() {
    const modal = document.getElementById('editClientModalOverlay');
    if (modal) modal.classList.remove('active');
}

function submitEditClientModal(event) {
    event.preventDefault();

    const code = document.getElementById('editModalCode').value;
    const index = clientsDatabase.findIndex(item => item.code === code);
    if (index === -1) return;

    clientsDatabase[index] = {
        ...clientsDatabase[index],
        name: document.getElementById('editModalName').value.trim(),
        cpf: document.getElementById('editModalCpf').value.trim(),
        age: document.getElementById('editModalAge').value.trim(),
        phone: document.getElementById('editModalPhone').value.trim(),
        email: document.getElementById('editModalEmail').value.trim(),
        process: document.getElementById('editModalProcess').value.trim(),
        type: document.getElementById('editModalType').value.trim(),
        court: document.getElementById('editModalCourt').value.trim(),
        status: document.getElementById('editModalStatus').value,
        deadline: document.getElementById('editModalDeadline').value.trim(),
        fee: document.getElementById('editModalFee').value.trim(),
        feeStatus: document.getElementById('editModalFeeStatus').value
    };

    saveData();
    renderAll();

    if (document.getElementById('fieldCode').value === code) {
        fillFormWithClient(clientsDatabase[index]);
    }

    closeEditClientModal();
    alert('Informações do cliente atualizadas com sucesso!');
}


/* =========================================================
   9. ABA PROCESSOS & FILTROS (ATIVOS / ENCERRADOS)
   ========================================================= */

function setProcessesFilter(filter, btnElement) {
    currentProcessesFilter = filter;

    const parentBar = btnElement.closest('.filter-tabs-bar');
    if (parentBar) {
        parentBar.querySelectorAll('.filter-tab-btn').forEach(b => b.classList.remove('active'));
    }
    btnElement.classList.add('active');

    renderProcessesTable();
}

function renderProcessesTable() {
    const body = document.getElementById('processesTableBody');
    const titleEl = document.getElementById('processesTableTitle');
    if (!body) return;

    body.innerHTML = '';

    let filtered = clientsDatabase;
    if (currentProcessesFilter === 'ativos') {
        filtered = clientsDatabase.filter(c => c.status !== 'Encerrado');
        if (titleEl) titleEl.textContent = 'Processos Ativos e em Andamento';
    } else if (currentProcessesFilter === 'encerrados') {
        filtered = clientsDatabase.filter(c => c.status === 'Encerrado');
        if (titleEl) titleEl.textContent = 'Processos Finalizados / Encerrados';
    } else {
        if (titleEl) titleEl.textContent = 'Todos os Processos Registrados';
    }

    if (filtered.length === 0) {
        body.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:30px;">Nenhum processo encontrado nesta categoria.</td></tr>`;
        return;
    }

    filtered.forEach(client => {
        body.innerHTML += `
            <tr>
                <td><strong>${escapeHTML(client.process)}</strong></td>
                <td>${escapeHTML(client.name)}</td>
                <td>${escapeHTML(client.type)}</td>
                <td>${escapeHTML(client.court)}</td>
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
   10. ABA PRAZOS
   ========================================================= */

function renderDeadlines() {
    const container = document.getElementById('deadlinesContainer');
    if (!container) return;

    container.innerHTML = '';

    clientsDatabase.forEach(client => {
        if (!client.deadline || client.deadline === 'A definir' || client.status === 'Encerrado') return;

        container.innerHTML += `
            <div class="timeline-item">
                <div>
                    <div class="timeline-date">
                        <i class="fa-regular fa-clock"></i>
                        ${escapeHTML(client.deadline)}
                    </div>
                    <div style="font-weight:600;margin-top:4px;color:var(--text-main);">
                        Cliente: ${escapeHTML(client.name)} (${escapeHTML(client.code)})
                    </div>
                    <div style="font-size:0.85rem;color:var(--text-muted);">
                        Processo: ${escapeHTML(client.process)}
                    </div>
                </div>
                <span class="badge ${getBadgeClass(client.status)}">
                    ${escapeHTML(client.status)}
                </span>
            </div>
        `;
    });

    customEventsDatabase.forEach(evt => {
        const brDate = formatIsoToBrDate(evt.date);
        const timeStr = evt.time ? ` às ${evt.time}` : '';

        container.innerHTML += `
            <div class="timeline-item" style="border-left-color: var(--success);">
                <div>
                    <div class="timeline-date" style="color: var(--success);">
                        <i class="fa-solid fa-calendar-check"></i>
                        ${escapeHTML(brDate)}${escapeHTML(timeStr)} - ${escapeHTML(evt.title)}
                    </div>
                    <div style="font-weight:600;margin-top:4px;color:var(--text-main);">
                        Categoria: ${escapeHTML(evt.category)} ${evt.clientName ? `| Cliente: ${escapeHTML(evt.clientName)}` : ''}
                    </div>
                    ${evt.notes ? `<div style="font-size:0.85rem;color:var(--text-muted);">${escapeHTML(evt.notes)}</div>` : ''}
                </div>
                <button type="button" class="btn btn-secondary" onclick="deleteCustomEvent('${escapeHTML(evt.id)}')" title="Excluir compromisso">
                    <i class="fa-solid fa-trash" style="color:var(--danger);"></i>
                </button>
            </div>
        `;
    });
}


/* =========================================================
   11. ABA CALENDÁRIO (INTERATIVO)
   ========================================================= */

let calendarInstance = null;

function getCalendarEvents() {
    const events = [];

    clientsDatabase.forEach(client => {
        if (client.status === 'Encerrado') return;
        const isoDate = parseBrDateToIso(client.deadline);
        if (!isoDate) return;

        const desc = client.deadline.replace(/^\d{2}\/\d{2}\/\d{4}\s*-?\s*/, '') || 'Prazo / Audiência';

        events.push({
            id: `CLIENT-${client.code}`,
            title: `${client.name} - ${desc}`,
            start: isoDate,
            backgroundColor: '#2563eb',
            borderColor: '#1d4ed8',
            extendedProps: {
                source: 'client',
                clientName: client.name,
                process: client.process,
                court: client.court
            }
        });
    });

    customEventsDatabase.forEach(evt => {
        const startDateTime = evt.time ? `${evt.date}T${evt.time}` : evt.date;
        let bgColor = '#10b981';
        if (evt.category === 'Audiência') bgColor = '#ef4444';
        if (evt.category === 'Prazo Processual') bgColor = '#f59e0b';

        events.push({
            id: evt.id,
            title: `[${evt.category}] ${evt.title}${evt.clientName && evt.clientName !== 'Escritório' ? ' - ' + evt.clientName : ''}`,
            start: startDateTime,
            backgroundColor: bgColor,
            borderColor: bgColor,
            extendedProps: {
                source: 'custom',
                eventId: evt.id,
                category: evt.category,
                clientName: evt.clientName,
                notes: evt.notes
            }
        });
    });

    return events;
}

function renderCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl || typeof FullCalendar === 'undefined') return;

    if (calendarInstance) {
        calendarInstance.destroy();
    }

    calendarInstance = new FullCalendar.Calendar(calendarEl, {
        locale: 'pt-br',
        initialView: 'dayGridMonth',
        height: 'auto',
        selectable: true,
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,listMonth'
        },
        buttonText: {
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana',
            list: 'Lista'
        },
        events: getCalendarEvents(),
        dateClick: function(info) {
            openEventModal(info.dateStr);
        },
        eventClick: function(info) {
            const props = info.event.extendedProps;
            if (props.source === 'custom') {
                const wantDelete = confirm(
                    `Compromisso: ${info.event.title}\n` +
                    `Data: ${info.event.start.toLocaleDateString('pt-BR')}\n` +
                    `${props.notes ? 'Obs: ' + props.notes + '\n' : ''}\n` +
                    `Deseja EXCLUIR este compromisso do calendário?`
                );
                if (wantDelete) {
                    deleteCustomEvent(props.eventId);
                }
            } else {
                alert(
                    `Prazo de Cliente: ${info.event.title}\n` +
                    `Processo: ${props.process || 'Não informado'}\n` +
                    `Vara: ${props.court || 'Não informada'}\n\n` +
                    `(Para alterar este prazo, edite a ficha do cliente.)`
                );
            }
        }
    });

    calendarInstance.render();
}

function openEventModal(prefilledDate = '') {
    const modal = document.getElementById('eventModalOverlay');
    if (!modal) return;

    document.getElementById('newEventForm').reset();

    if (prefilledDate) {
        document.getElementById('eventDate').value = prefilledDate;
    }

    const clientSelect = document.getElementById('eventClientSelect');
    clientSelect.innerHTML = '<option value="">-- Compromisso Avulso / Escritório --</option>';
    clientsDatabase.forEach(client => {
        const opt = document.createElement('option');
        opt.value = client.code;
        opt.textContent = `${client.name} (${client.code})`;
        clientSelect.appendChild(opt);
    });

    modal.classList.add('active');
}

function closeEventModal() {
    const modal = document.getElementById('eventModalOverlay');
    if (modal) modal.classList.remove('active');
}

function saveNewEvent(event) {
    event.preventDefault();

    const title = document.getElementById('eventTitle').value.trim();
    const category = document.getElementById('eventType').value;
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    const clientCode = document.getElementById('eventClientSelect').value;
    const notes = document.getElementById('eventNotes').value.trim();

    if (!title || !date) {
        alert('Informe o título e a data do compromisso.');
        return;
    }

    let clientName = 'Escritório';
    if (clientCode) {
        const foundClient = clientsDatabase.find(c => c.code === clientCode);
        if (foundClient) clientName = foundClient.name;
    }

    const newEvent = {
        id: `EVT-${Date.now()}`,
        title,
        category,
        date,
        time,
        clientCode,
        clientName,
        notes
    };

    customEventsDatabase.push(newEvent);
    saveCustomEvents();
    renderAll();
    closeEventModal();

    alert('Compromisso adicionado ao Calendário e à aba Prazos!');
}

function deleteCustomEvent(eventId) {
    customEventsDatabase = customEventsDatabase.filter(e => e.id !== eventId);
    saveCustomEvents();
    renderAll();
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
    return Number.isFinite(number) ? number : 0;
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function renderFinancialTable() {
    const body = document.getElementById('financialTableBody');
    if (!body) return;

    body.innerHTML = '';

    clientsDatabase.forEach(client => {
        body.innerHTML += `
            <tr>
                <td><strong>${escapeHTML(client.name)}</strong></td>
                <td>Ação ${escapeHTML(client.type)}</td>
                <td><strong>${escapeHTML(client.fee || 'R$ 0,00')}</strong></td>
                <td>${escapeHTML(client.deadline || 'Não informado')}</td>
                <td>
                    <span class="badge ${getBadgeClass(client.feeStatus || 'Pendente')}">
                        ${escapeHTML(client.feeStatus || 'Pendente')}
                    </span>
                </td>
            </tr>
        `;
    });
}

function updateFinancialSummary() {
    const pendingElement = document.getElementById('totalPendingFee');
    const receivedElement = document.getElementById('totalReceivedFee');
    const contractsElement = document.getElementById('activeContractsCount');

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

    if (pendingElement) pendingElement.textContent = formatCurrency(pending);
    if (receivedElement) receivedElement.textContent = formatCurrency(received);
    if (contractsElement) contractsElement.textContent = clientsDatabase.length;
}


/* =========================================================
   13. FICHA DO CLIENTE NO PAINEL
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
        if (element) element.value = value;
    });

    const statusSelect = document.getElementById('fieldStatusSelect');
    if (statusSelect) {
        statusSelect.value = client.status || 'Em Andamento';
    }

    const suggestions = document.getElementById('suggestionsList');
    const search = document.getElementById('clientSearch');

    if (suggestions) suggestions.style.display = 'none';
    if (search) search.value = client.name;
}

function saveEditedClient(event) {
    event.preventDefault();

    const code = document.getElementById('fieldCode').value.trim();
    if (!code) {
        alert('Selecione um cliente na busca rápida ou na tabela antes de salvar.');
        return;
    }

    const index = clientsDatabase.findIndex(item => item.code === code);
    if (index === -1) {
        alert('Cliente não encontrado.');
        return;
    }

    clientsDatabase[index] = {
        ...clientsDatabase[index],
        name: document.getElementById('fieldName').value.trim(),
        cpf: document.getElementById('fieldCpf').value.trim(),
        age: document.getElementById('fieldAge').value.trim(),
        process: document.getElementById('fieldProcess').value.trim(),
        type: document.getElementById('fieldType').value.trim(),
        court: document.getElementById('fieldCourt').value.trim(),
        status: document.getElementById('fieldStatusSelect').value,
        phone: document.getElementById('fieldPhone').value.trim(),
        email: document.getElementById('fieldEmail').value.trim(),
        deadline: document.getElementById('fieldDeadline').value.trim()
    };

    saveData();
    renderAll();
    alert(`Alterações de ${clientsDatabase[index].name} salvas com sucesso!`);
}

function resetForm() {
    const ids = [
        'fieldCode', 'fieldName', 'fieldCpf', 'fieldAge',
        'fieldProcess', 'fieldType', 'fieldCourt',
        'fieldPhone', 'fieldEmail', 'fieldDeadline'
    ];

    ids.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });

    const statusSelect = document.getElementById('fieldStatusSelect');
    if (statusSelect) statusSelect.value = 'Em Andamento';

    const search = document.getElementById('clientSearch');
    if (search) search.value = '';
}


/* =========================================================
   14. EXCLUIR CLIENTE
   ========================================================= */

function deleteClient(code) {
    const client = clientsDatabase.find(item => item.code === code);
    if (!client) return;

    const confirmed = confirm(`Deseja realmente remover o cliente ${client.name} (${code})?`);
    if (!confirmed) return;

    clientsDatabase = clientsDatabase.filter(item => item.code !== code);

    saveData();
    renderAll();
    resetForm();
}


/* =========================================================
   15. AUTOCOMPLETE
   ========================================================= */

function setupSearch() {
    const searchInput = document.getElementById('clientSearch');
    const suggestionsList = document.getElementById('suggestionsList');

    if (!searchInput || !suggestionsList) return;

    searchInput.addEventListener('input', event => {
        const query = event.target.value.toLowerCase().trim();

        if (!query) {
            suggestionsList.style.display = 'none';
            return;
        }

        const matches = clientsDatabase.filter(client => {
            return (
                String(client.name).toLowerCase().includes(query) ||
                String(client.cpf).toLowerCase().includes(query) ||
                String(client.code).toLowerCase().includes(query)
            );
        });

        if (!matches.length) {
            suggestionsList.style.display = 'none';
            return;
        }

        suggestionsList.innerHTML = '';

        matches.forEach(client => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';

            div.innerHTML = `
                <div class="suggestion-info">
                    <div class="client-name">${escapeHTML(client.name)}</div>
                    <div class="client-meta">
                        CPF: ${escapeHTML(client.cpf)} | Proc: ${escapeHTML(client.process)}
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
        if (!searchInput.contains(event.target) && !suggestionsList.contains(event.target)) {
            suggestionsList.style.display = 'none';
        }
    });
}


/* =========================================================
   16. MODAL NOVO CLIENTE
   ========================================================= */

function setupNewClientModal() {
    const modal = document.getElementById('modalOverlay');
    const openButton = document.getElementById('btnOpenModal');
    const closeButton = document.getElementById('btnCloseModal');
    const cancelButton = document.getElementById('btnCancelModal');
    const form = document.getElementById('newClientForm');

    if (!modal || !form) return;

    const closeModal = () => modal.classList.remove('active');

    if (openButton) openButton.addEventListener('click', () => modal.classList.add('active'));
    if (closeButton) closeButton.addEventListener('click', closeModal);
    if (cancelButton) cancelButton.addEventListener('click', closeModal);

    form.addEventListener('submit', event => {
        event.preventDefault();

        const name = document.getElementById('newFormName').value.trim();
        const cpf = document.getElementById('newFormCpf').value.trim();
        const age = document.getElementById('newFormAge').value.trim();
        const phone = document.getElementById('newFormPhone').value.trim();

        if (!name || !cpf || !age || !phone) {
            alert('Preencha todos os campos obrigatórios.');
            return;
        }

        const numbers = clientsDatabase.map(client => {
            const match = String(client.code).match(/CLI-(\d+)/);
            return match ? Number(match[1]) : 1000;
        });

        const nextNumber = Math.max(1000, ...numbers) + 1;

        const rawDate = document.getElementById('newFormDeadlineDate').value;
        const desc = document.getElementById('newFormDeadlineDesc').value.trim();
        let formattedDeadline = 'A definir';

        if (rawDate) {
            const brDate = formatIsoToBrDate(rawDate);
            formattedDeadline = desc ? `${brDate} - ${desc}` : `${brDate} - Prazo / Audiência`;
        } else if (desc) {
            formattedDeadline = desc;
        }

        const newClient = {
            code: `CLI-${nextNumber}`,
            name,
            cpf,
            age,
            process: document.getElementById('newFormProcess').value.trim() || '0000000-00.0000.0.00.0000',
            type: document.getElementById('newFormType').value.trim() || 'Geral',
            court: document.getElementById('newFormCourt').value.trim() || 'Não Informada',
            status: document.getElementById('newFormStatus').value,
            phone,
            email: document.getElementById('newFormEmail').value.trim() || '',
            deadline: formattedDeadline,
            fee: document.getElementById('newFormFee').value.trim() || 'R$ 0,00',
            feeStatus: 'Pendente'
        };

        clientsDatabase.unshift(newClient);

        saveData();
        renderAll();
        fillFormWithClient(newClient);

        form.reset();
        closeModal();

        switchTab('painel');
        alert(`Cliente ${newClient.code} cadastrado com sucesso.`);
    });
}


/* =========================================================
   17. EXPORTAÇÃO, BACKUP & IMPRESSÃO
   ========================================================= */

function openExportModal() {
    const modal = document.getElementById('exportModalOverlay');
    if (modal) modal.classList.add('active');
}

function closeExportModal() {
    const modal = document.getElementById('exportModalOverlay');
    if (modal) modal.classList.remove('active');
}

function createBackupObject() {
    return {
        app: 'Prazzo',
        version: '1.4',
        exportedAt: new Date().toISOString(),
        profile: userProfile,
        clients: clientsDatabase,
        events: customEventsDatabase
    };
}

function createBackupJSON() {
    return JSON.stringify(createBackupObject(), null, 2);
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

function exportData() {
    const json = createBackupJSON();
    const date = new Date().toISOString().slice(0, 10);
    downloadFile(json, `prazzo-backup-${date}.json`, 'application/json;charset=utf-8');
    alert('Backup JSON exportado com sucesso.');
}

function csvEscape(value) {
    const text = String(value ?? '');
    return `"${text.replace(/"/g, '""')}"`;
}

function exportCSV() {
    const headers = [
        'Código', 'Nome', 'CPF', 'Idade', 'Processo', 'Tipo',
        'Vara/Tribunal', 'Status', 'Telefone', 'E-mail',
        'Prazo', 'Honorários', 'Status Honorários'
    ];

    const rows = clientsDatabase.map(client => [
        client.code, client.name, client.cpf, client.age,
        client.process, client.type, client.court, client.status,
        client.phone, client.email, client.deadline, client.fee,
        client.feeStatus
    ]);

    const csv = [headers, ...rows]
        .map(row => row.map(csvEscape).join(';'))
        .join('\r\n');

    const content = '\uFEFF' + csv;
    const date = new Date().toISOString().slice(0, 10);
    downloadFile(content, `prazzo-clientes-${date}.csv`, 'text/csv;charset=utf-8');
    alert('Arquivo CSV exportado com sucesso.');
}

async function shareData() {
    const json = createBackupJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const date = new Date().toISOString().slice(0, 10);
    const filename = `prazzo-backup-${date}.json`;

    try {
        if (navigator.share && typeof File !== 'undefined') {
            const file = new File([blob], filename, { type: 'application/json' });
            if (!navigator.canShare || navigator.canShare({ files: [file] })) {
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
                text: `Backup do Prazzo com ${clientsDatabase.length} cliente(s).`
            });
            return;
        }

        alert('O compartilhamento nativo não é suportado neste navegador. Use a opção de Backup JSON.');
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Erro ao compartilhar:', error);
            alert('Não foi possível compartilhar automaticamente.');
        }
    }
}

function sendByEmail() {
    const subject = encodeURIComponent(`Backup do Prazzo - ${new Date().toLocaleDateString('pt-BR')}`);
    const body = encodeURIComponent(
        `Olá,\n\nSegue o backup do sistema Prazzo.\n\nQuantidade de clientes: ${clientsDatabase.length}\n\nAtenciosamente,\n${userProfile.name || 'Usuário Prazzo'}\n${userProfile.oab || ''}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

async function copyDataToClipboard() {
    const json = createBackupJSON();
    try {
        await navigator.clipboard.writeText(json);
        alert('Dados copiados para a área de transferência.');
    } catch (error) {
        const textarea = document.createElement('textarea');
        textarea.value = json;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
        alert('Dados copiados para a área de transferência.');
    }
}

function printReport() {
    const date = new Date().toLocaleString('pt-BR');
    const rows = clientsDatabase.map(client => `
        <tr>
            <td>${escapeHTML(client.code)}</td>
            <td>${escapeHTML(client.name)}</td>
            <td>${escapeHTML(client.cpf)}</td>
            <td>${escapeHTML(client.process)}</td>
            <td>${escapeHTML(client.type)}</td>
            <td>${escapeHTML(client.status)}</td>
            <td>${escapeHTML(client.fee)}</td>
        </tr>
    `).join('');

    const report = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Relatório - Prazzo</title>
            <style>
                * { box-sizing: border-box; }
                body { font-family: Arial, sans-serif; margin: 40px; color: #111827; }
                h1 { margin-bottom: 5px; }
                .subtitle { color: #64748b; margin-bottom: 25px; }
                .info { margin-bottom: 25px; line-height: 1.7; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; }
                th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
                th { background: #f1f5f9; }
                .footer { margin-top: 30px; font-size: 11px; color: #64748b; }
            </style>
        </head>
        <body>
            <h1>Prazzo</h1>
            <div class="subtitle">Relatório de Gestão Jurídica</div>
            <div class="info">
                <strong>Advogado:</strong> ${escapeHTML(userProfile.name)}<br>
                <strong>OAB:</strong> ${escapeHTML(userProfile.oab)}<br>
                <strong>Clientes cadastrados:</strong> ${clientsDatabase.length}<br>
                <strong>Gerado em:</strong> ${date}
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
                <tbody>${rows}</tbody>
            </table>
            <div class="footer">Documento gerado pelo sistema Prazzo.</div>
            <script>window.onload = function() { window.print(); };<\/script>
        </body>
        </html>
    `;

    const reportWindow = window.open('', '_blank', 'width=1200,height=800');
    if (!reportWindow) {
        alert('O navegador bloqueou a janela de impressão. Permita pop-ups para o Prazzo.');
        return;
    }
    reportWindow.document.open();
    reportWindow.document.write(report);
    reportWindow.document.close();
}

function importJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(loadEvent) {
        try {
            const backup = JSON.parse(loadEvent.target.result);
            if (!backup || !Array.isArray(backup.clients)) {
                throw new Error('Formato de backup inválido.');
            }

            if (!confirm('Importar este backup substituirá os dados atuais deste dispositivo. Deseja continuar?')) {
                event.target.value = '';
                return;
            }

            clientsDatabase = backup.clients;
            if (Array.isArray(backup.events)) {
                customEventsDatabase = backup.events;
            }
            if (backup.profile && typeof backup.profile === 'object') {
                userProfile = { ...defaultProfile, ...backup.profile };
            }

            saveData();
            saveCustomEvents();
            saveProfileData();
            renderAll();
            resetForm();

            alert(`Backup importado com sucesso.\n\n${clientsDatabase.length} cliente(s) restaurado(s).`);
            closeExportModal();
        } catch (error) {
            console.error('Erro ao importar backup:', error);
            alert('Não foi possível importar o arquivo. Verifique se ele é um backup JSON válido do Prazzo.');
        } finally {
            event.target.value = '';
        }
    };
    reader.readAsText(file);
}

function setupModalClosing() {
    document.addEventListener('click', event => {
        const modalIds = [
            'modalOverlay',
            'editClientModalOverlay',
            'eventModalOverlay',
            'profileModalOverlay',
            'exportModalOverlay'
        ];

        modalIds.forEach(id => {
            const modal = document.getElementById(id);
            if (modal && event.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
            modal.classList.remove('active');
        });
    });
}


/* =========================================================
   18. INICIALIZAÇÃO
   ========================================================= */
""
document.addEventListener('DOMContentLoaded', () => {
    const hasSavedProfile = localStorage.getItem('jusgestao_perfil');

    renderAll();
    setupSearch();
    setupNewClientModal();
    setupModalClosing();
    initDarkMode();

    if (!hasSavedProfile) {
        setTimeout(() => {
            openProfileModal();
        }, 500);
    }
});




function confirmDeleteAccount() {
    if (!confirm('ATENÇÃO: Deseja realmente excluir permanentemente a sua conta e todos os dados guardados?')) return;
    
    const senhaInformada = prompt('Para confirmar a exclusão da conta, digite a sua senha de acesso:');
    if (senhaInformada === null) return; // Se o usuário cancelar

    // Recupera o perfil salvo para checar a senha
    const perfilSalvo = JSON.parse(localStorage.getItem('jusgestao_perfil')) || { password: '123' };
    const senhaCorreta = perfilSalvo.password || '123';

    if (senhaInformada === senhaCorreta) {
        // Limpa todo o armazenamento local do sistema
        localStorage.clear();
        alert('Conta e dados excluídos com sucesso.');
        window.location.href = 'login/index.html';
    } else {
        alert('Senha incorreta! A exclusão foi cancelada por segurança.');
    }
}