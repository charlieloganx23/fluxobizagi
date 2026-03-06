// Configuração
const ADMIN_PASSWORD = 'admin123'; // TODO: Trocar por variável de ambiente
let currentDiagrams = [];

// Autenticação
function authenticate() {
    const password = document.getElementById('passwordInput').value;
    const errorElement = document.getElementById('authError');
    
    if (password === ADMIN_PASSWORD) {
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        loadDiagrams();
        sessionStorage.setItem('authenticated', 'true');
    } else {
        errorElement.textContent = '❌ Senha incorreta!';
    }
}

// Verifica se já está autenticado
window.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('authenticated') === 'true') {
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        loadDiagrams();
    }
    
    // Event listener para upload de arquivo
    document.getElementById('svgFile').addEventListener('change', (e) => {
        const fileName = e.target.files[0]?.name || 'Nenhum arquivo selecionado';
        document.getElementById('fileName').textContent = fileName;
    });
    
    // Event listener para submit do formulário
    document.getElementById('uploadForm').addEventListener('submit', handleUpload);
});

// Navegação entre tabs
function showTab(tabName) {
    // Atualiza botões
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Atualiza conteúdo
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.getElementById(tabName + 'Tab').style.display = 'block';
    
    // Carrega dados se necessário
    if (tabName === 'list') {
        loadDiagrams();
    } else if (tabName === 'remove') {
        populateRemoveSelect();
    }
}

// Toggle do select de processo pai
function toggleParentSelect() {
    const diagramType = document.getElementById('diagramType').value;
    const parentGroup = document.getElementById('parentProcessGroup');
    
    if (diagramType === 'subprocess') {
        parentGroup.style.display = 'block';
        populateParentSelect();
    } else {
        parentGroup.style.display = 'none';
    }
}

// Popula select de processos pai
function populateParentSelect() {
    const select = document.getElementById('parentProcess');
    select.innerHTML = '<option value="">Selecione o processo pai...</option>';
    
    // Filtra apenas processos macro (não subprocessos)
    const macroProcesses = currentDiagrams.filter(d => !d.isSubprocessPage);
    
    macroProcesses.forEach(diagram => {
        const option = document.createElement('option');
        option.value = diagram.id;
        option.textContent = diagram.name;
        select.appendChild(option);
    });
}

// Popula select de remoção
function populateRemoveSelect() {
    const select = document.getElementById('diagramToRemove');
    select.innerHTML = '<option value="">Selecione um diagrama...</option>';
    
    currentDiagrams.forEach(diagram => {
        const option = document.createElement('option');
        option.value = diagram.id;
        option.textContent = `${diagram.name}${diagram.isSubprocessPage ? ' (Subprocesso)' : ''}`;
        select.appendChild(option);
    });
}

// Carrega lista de diagramas do configuration.json.js
async function loadDiagrams() {
    try {
        const response = await fetch('/api/get-diagrams');
        const data = await response.json();
        
        if (data.success) {
            currentDiagrams = data.diagrams;
            displayDiagrams(data.diagrams);
            populateParentSelect();
        } else {
            throw new Error(data.error || 'Erro ao carregar diagramas');
        }
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('diagramsList').innerHTML = 
            `<p class="error">❌ Erro ao carregar diagramas: ${error.message}</p>`;
    }
}

// Exibe lista de diagramas
function displayDiagrams(diagrams) {
    const container = document.getElementById('diagramsList');
    
    if (diagrams.length === 0) {
        container.innerHTML = '<p>Nenhum diagrama encontrado.</p>';
        return;
    }
    
    let html = '';
    diagrams.forEach(diagram => {
        const badge = diagram.isSubprocessPage 
            ? '<span class="badge subprocess">Subprocesso</span>' 
            : '<span class="badge macro">Macro</span>';
        
        const parentInfo = diagram.isSubprocessPage 
            ? `<p>📁 Pertence a: ${getParentName(diagram) || 'N/A'}</p>` 
            : '';
        
        html += `
            <div class="diagram-item">
                <div class="diagram-info">
                    <h3>${diagram.name} ${badge}</h3>
                    ${parentInfo}
                    <p>📄 ${diagram.image}</p>
                    <p>👤 ${diagram.author} | v${diagram.version}</p>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Obtém nome do processo pai
function getParentName(subprocess) {
    const parent = currentDiagrams.find(d => 
        d.subPages && d.subPages.includes(subprocess.id)
    );
    return parent ? parent.name : null;
}

// Upload de novo diagrama
async function handleUpload(e) {
    e.preventDefault();
    
    const fileInput = document.getElementById('svgFile');
    const name = document.getElementById('diagramName').value;
    const type = document.getElementById('diagramType').value;
    const author = document.getElementById('author').value;
    const parentId = document.getElementById('parentProcess').value;
    
    if (!fileInput.files[0]) {
        showMessage('uploadMessage', 'Por favor, selecione um arquivo SVG.', 'error');
        return;
    }
    
    if (type === 'subprocess' && !parentId) {
        showMessage('uploadMessage', 'Por favor, selecione o processo pai.', 'error');
        return;
    }
    
    // Mostra loader
    document.getElementById('uploadBtnText').style.display = 'none';
    document.getElementById('uploadLoader').style.display = 'inline-block';
    
    try {
        // Lê o arquivo
        const file = fileInput.files[0];
        const fileContent = await readFileAsBase64(file);
        
        // Envia para a API
        const response = await fetch('/api/add-diagram', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fileName: file.name,
                fileContent: fileContent,
                name: name,
                isSubprocess: type === 'subprocess',
                parentId: parentId || null,
                author: author || 'Usuário'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('uploadMessage', `✅ Diagrama "${name}" adicionado com sucesso! Deploy em andamento...`, 'success');
            
            // Limpa formulário
            document.getElementById('uploadForm').reset();
            document.getElementById('fileName').textContent = 'Nenhum arquivo selecionado';
            
            // Recarrega lista
            setTimeout(() => loadDiagrams(), 2000);
        } else {
            throw new Error(data.error || 'Erro desconhecido');
        }
    } catch (error) {
        console.error('Erro:', error);
        showMessage('uploadMessage', `❌ Erro: ${error.message}`, 'error');
    } finally {
        // Esconde loader
        document.getElementById('uploadBtnText').style.display = 'inline';
        document.getElementById('uploadLoader').style.display = 'none';
    }
}

// Remove diagrama
async function removeDiagram() {
    const diagramId = document.getElementById('diagramToRemove').value;
    
    if (!diagramId) {
        showMessage('removeMessage', 'Por favor, selecione um diagrama.', 'error');
        return;
    }
    
    const diagram = currentDiagrams.find(d => d.id === diagramId);
    
    if (!confirm(`Tem certeza que deseja remover "${diagram.name}"?`)) {
        return;
    }
    
    try {
        const response = await fetch('/api/remove-diagram', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ diagramId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('removeMessage', `✅ Diagrama removido com sucesso!`, 'success');
            loadDiagrams();
            document.getElementById('diagramToRemove').value = '';
        } else {
            throw new Error(data.error || 'Erro desconhecido');
        }
    } catch (error) {
        console.error('Erro:', error);
        showMessage('removeMessage', `❌ Erro: ${error.message}`, 'error');
    }
}

// Helpers
function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function showMessage(elementId, text, type) {
    const element = document.getElementById(elementId);
    element.textContent = text;
    element.className = `message ${type}`;
}
