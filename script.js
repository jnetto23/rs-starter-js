
const logo    = document.getElementById('logo');
const header  = document.querySelector('header');
const content = document.querySelector('main');
const form    = document.getElementById('form-search');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    let input = form.querySelector('input[name=user]').value.trim();
    if(input.length === 0) {
        clearInput();
        return;
    };

    queryWithPromisse();
    clearInput();
    header.classList.add('top');
    content.classList.remove('d-none');
});
logo.addEventListener('click', () => {
    if(document.getElementById('user-git')) document.getElementById('user-git').remove();
    if(header.classList.contains('top')) header.classList.remove('top');
    if(!content.classList.contains('d-none')) content.classList.add('d-none');
    clearInput();
});
// Function principal (COM PROMISSE);
function queryWithPromisse () {
    if(document.getElementById('user-git')) document.getElementById('user-git').remove();

    let x = document.createElement('div');
    x.appendChild(document.createTextNode('Carregando...'));
    x.setAttribute('id', 'loading');
    content.appendChild(x);

    let user = form.querySelector('input[name=user]').value.trim().toLowerCase();
    getUserWithPromises(user)
        .then( resolve => {
            exibirUser(resolve);
            
            let totalRepos = resolve.public_repos;
            let totalPages = Math.trunc(totalRepos / 30) + 1;
            
            for(let i = 1; i <= totalPages; i++) {
                getReposWithPromises(user, i)
                    .then(resolve => {
                        exibirRepos(resolve);
                    });
            };

        })
        .catch( reject => {
            console.error(reject);
            exibirUser('Usuário não encontrado!');
            clearInput();
        });
};
// Function para pegar o usuário (COM PROMISSES);
function getUserWithPromises (user) {
    return new Promise( function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', `https://api.github.com/users/${user}`);
        xhr.send(null);

        xhr.onreadystatechange = () => {
            if(xhr.readyState === 4) {
                if(xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject('Usuário inexistente');
                };
            };
        };
    });
};
// Function para pegar os repositorios (COM PROMISSES);
function getReposWithPromises (user, page) {
    return new Promise( function (resolve) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', `https://api.github.com/users/${user}/repos?page=${page}&per_pege=30`);
        xhr.send(null);

        xhr.onreadystatechange = () => {
            if(xhr.readyState === 4) {
                if(xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                }; 
            };
        };
    });
};
// Function Auxiliar
function clearInput() {
    form.querySelector('input[name=user]').value = '';
    form.querySelector('input[name=user]').focus();
};
function elipseDesc() {
    let descs = document.querySelectorAll('.repo-desc');
    if(descs.length <= 0) return;
    Array.prototype.forEach.call(descs, desc => {
        while (desc.scrollHeight > desc.offsetHeight) {
            desc.textContent = desc.textContent.replace(/\W*\s(\S)*$/, '...');
        };
    });
};
// Funcion para exibir dados do user
function exibirUser(user) {
    if(document.getElementById('loading')) document.getElementById('loading').remove();
    if(document.getElementById('user-git')) document.getElementById('user-git').remove();
    
    // Verifica se existe usuário
    if(typeof user === 'string') {
        let error    = document.createElement('div');
        error.appendChild(document.createTextNode(user));
        error.classList.add('alert-error');
        error.setAttribute('id', 'user-git');
        content.appendChild(error);
        return;
    };

    // Exibir o usuário
    let div = document.createElement('div');
    div.setAttribute('id', 'user-git');
    let div1 = document.createElement('div');
    div1.setAttribute('id', 'user-info');
    div.appendChild(div1);

    let img = document.createElement('img');
    img.setAttribute('src', user.avatar_url);
    div1.appendChild(img);
    
    let name = document.createElement('span');
    name.appendChild(document.createTextNode(user.name));
    name.classList.add('name');
    div1.appendChild(name);

    let login = document.createElement('span');
    login.appendChild(document.createTextNode(user.login));
    login.classList.add('login');
    div1.appendChild(login);

    if(user.bio) {
        let bio = document.createElement('p');
        bio.appendChild(document.createTextNode(user.bio));
        bio.classList.add('bio');
        div1.appendChild(bio);
    }

    if(user.company) {
        let companyList = user.company.trimEnd().split(' ');
        for(let i = 0; i < companyList.length; i++) {
            let company = document.createElement('a');
            company.appendChild(document.createTextNode(companyList[i]));
            company.setAttribute('href', `https://github.com/${companyList[i].replace('@', '')}`);
            company.setAttribute('target', '_blank');
            company.classList.add('company');
            div1.appendChild(company);
        }
    }

    if(user.location) {
        let location = document.createElement('span');
        location.appendChild(document.createTextNode(user.location));
        location.classList.add('location');
        div1.appendChild(location);
    }

    if(user.blog) {
        let blogList = user.blog.trimEnd().split(' ');
        for(let i = 0; i < blogList.length; i++) {
            let blog = document.createElement('a');
            blog.appendChild(document.createTextNode(blogList[i]));
            blog.setAttribute('href', blogList[i]);
            blog.setAttribute('target', '_blank');
            blog.classList.add('blog');
            div1.appendChild(blog);
        }
    }

    content.appendChild(div);
};
// Funcion para exibir dados dos repos
function exibirRepos(repos) {
    if(repos.length <= 0) return;
    
    let languages = {};
    let listRepos;
    
    if(document.getElementById('repos-info')) {
        listRepos = document.getElementById('repos-info');
    } else {
        listRepos = document.createElement('div');
        listRepos.setAttribute('id', 'repos-info');
    };   

    for(repo of repos) {
        listRepos.appendChild(this.repoHTML(repo));
        
        // Monta array de linguages;
        let l = repo.language || 'Undefined'; 
        (languages.hasOwnProperty(l)) ? languages[l] += 1 : languages[l] = 1;

    };
    
    document.getElementById('user-git').appendChild(listRepos);
    elipseDesc();

    if(document.querySelector('.projects')) document.querySelector('.projects').remove();
    if(document.querySelector('.filter')) document.querySelector('.filter').remove();

    // Select
    let divSelect = document.createElement('div');
    divSelect.classList.add('filter');

    document.getElementById('repos-info').insertBefore(divSelect, document.getElementById('repos-info').firstChild);

    let select = document.createElement('select');
    divSelect.appendChild(select);

    let oT = document.createElement('option');
    oT.setAttribute('value', 'todos');
    oT.appendChild(document.createTextNode('Todos'));
    select.appendChild(oT);

    // Relação de linguages de Projetos
    let projectsDiv = document.createElement('div');
    projectsDiv.classList.add('projects');
    let title = document.createElement('span');
    title.classList.add('projects-title');
    let titleTXT = document.createTextNode('Projetos');
    title.appendChild(titleTXT);
    projectsDiv.appendChild(title);

    let R = document.querySelectorAll('.repo');
    let T = R.length;
    
    let total = document.createElement('a');
    total.setAttribute('href', '#');
    total.setAttribute('data-filter', 'todos');
    totalTxt = document.createTextNode(`Todos [${T}]`);
    total.appendChild(totalTxt);
    projectsDiv.appendChild(total);    
    
    let Langs = {};
    R.forEach(r => {
        (Langs[r.getAttribute('data-language')]) ? Langs[r.getAttribute('data-language')] += 1 : Langs[r.getAttribute('data-language')] = 1;
    });

    for(l of Object.keys(Langs).sort()) {
        let a = document.createElement('a');
        a.setAttribute('href', '#')
        a.setAttribute('data-filter', l);
        let aTxt = document.createTextNode(`${l} [${Langs[l]}]`);         
        a.appendChild(aTxt);
        projectsDiv.appendChild(a);

        let o = document.createElement('option');
        o.setAttribute('value', l);
        o.appendChild(document.createTextNode(l));
        select.appendChild(o);
    };


    document.getElementById('user-info').appendChild(projectsDiv);
    filterReposLink(projectsDiv);
    filterReposSelect(select);
};
function repoHTML(repo) {
    let el = document.createElement('div');
    el.classList.add('repo');
    el.setAttribute('data-language', repo.language || 'Undefined');
    
    let name = document.createElement('a');
    name.appendChild(document.createTextNode(repo.name));
    name.setAttribute('href', repo.html_url);
    name.setAttribute('target', '_blank');
    name.classList.add('repo-name');
    el.appendChild(name);

    let desc = document.createElement('p');
    desc.appendChild(document.createTextNode(repo.description || ''));
    desc.classList.add('repo-desc');
    el.appendChild(desc);

    let footer = document.createElement('div');
    footer.classList.add('footer');

    let language = document.createElement('span');
    language.appendChild(document.createTextNode(repo.language || ''));
    language.classList.add('repo-language');
    footer.appendChild(language);

    el.appendChild(footer);
    return el;
};
function filterReposLink(links) {
    let lks = links.querySelectorAll('a');
    Array.prototype.forEach.call(lks, lk => {
        lk.addEventListener('click', (e) => {
            e.preventDefault();
            let s = document.querySelector('div.filter > select');
            let o = document.querySelector(`div.filter > select > option[value=${lk.getAttribute('data-filter')}]`).index
            s.selectedIndex = o;
            filterRepos(lk.getAttribute('data-filter'));
        });
    });
};
function filterReposSelect(select) {
    select.addEventListener('change', () => {
        filterRepos(select.value);
    });
    
};
function filterRepos(filter) {    
    let cRepos = document.querySelectorAll(`#repos-info .repo`);
    Array.prototype.forEach.call(cRepos, repo => {
        if(repo.classList.contains('d-none')) repo.classList.remove('d-none');
    });

    if(filter !== 'todos') {
        let repos = document.querySelectorAll(`#repos-info .repo:not([data-language=${filter}])`);
        Array.prototype.forEach.call(repos, repo => {
            if(!repo.classList.contains('d-none')) repo.classList.add('d-none');
        });
    };
};