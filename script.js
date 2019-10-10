
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
    let user = form.querySelector('input[name=user]').value.trim().toLowerCase();
    getUserWithPromises(user)
        .then( resolve => {
            exibirUser(resolve);
            getReposWithPromises(user)
                .then(resolve => {
                    exibirRepos(resolve);
                });
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
function getReposWithPromises (user) {
    return new Promise( function (resolve) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', `https://api.github.com/users/${user}/repos`);
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
    if(document.getElementById('user-git')) document.getElementById('user-git').remove();
    
    // Verifica se existe usuário
    if(typeof user === 'string') {
        let error    = document.createElement('div');
        let errorTxt = document.createTextNode(user);
        error.appendChild(errorTxt);
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
    let nameTxt = document.createTextNode(user.name);
    name.appendChild(nameTxt);
    name.classList.add('name');
    div1.appendChild(name);

    let login = document.createElement('span');
    let loginTxt = document.createTextNode(user.login);
    login.appendChild(loginTxt);
    login.classList.add('login');
    div1.appendChild(login);

    let bio = document.createElement('p');
    let bioTxt = document.createTextNode(user.bio);
    bio.appendChild(bioTxt);
    bio.classList.add('bio');
    div1.appendChild(bio);

    let companyList = user.company.trimEnd().split(' ');
    for(let i = 0; i < companyList.length; i++) {
        let company = document.createElement('a');
        let companyTxt = document.createTextNode(companyList[i]);
        company.appendChild(companyTxt);
        company.setAttribute('href', `https://github.com/${companyList[i].replace('@', '')}`);
        company.setAttribute('target', '_blank');
        company.classList.add('company');
        div1.appendChild(company);
    }

    let location = document.createElement('span');
    let locationTxt = document.createTextNode(user.location);
    location.appendChild(locationTxt);
    location.classList.add('location');
    div1.appendChild(location);

    let blogList = user.blog.trimEnd().split(' ');
    for(let i = 0; i < blogList.length; i++) {
        let blog = document.createElement('a');
        let blogTxt = document.createTextNode(blogList[i]);
        blog.appendChild(blogTxt);
        blog.setAttribute('href', blogList[i]);
        blog.setAttribute('target', '_blank');
        blog.classList.add('blog');
        div1.appendChild(blog);
    }

    content.appendChild(div);
};

// Funcion para exibir dados dos repos
function exibirRepos(repos) {
    if(repos.length <= 0) return;
    let languages = {};
    let div = document.createElement('div');
    div.setAttribute('id', 'repos-info');
    
    let filter = document.createElement('div');
    filter.classList.add('filter');

    let select = document.createElement('select');
    let opt = document.createElement('option');
    let optText = document.createTextNode('Todos');
    opt.appendChild(optText);
    opt.setAttribute('value', 'todos');
    select.appendChild(opt);
    filter.appendChild(select);
    div.appendChild(filter);


    for(repo of repos) {
        let el = document.createElement('div');
        el.classList.add('repo');
        el.setAttribute('data-language', repo.language || 'Undefined');
        
        let name = document.createElement('a');
        let nameTxt = document.createTextNode(repo.name);
        name.appendChild(nameTxt);
        name.setAttribute('href', repo.html_url);
        name.setAttribute('target', '_blank');
        name.classList.add('repo-name');
        el.appendChild(name);

        let desc = document.createElement('p');
        let descTxt = document.createTextNode(repo.description || '');
        desc.appendChild(descTxt);
        desc.classList.add('repo-desc');
        el.appendChild(desc);

        let footer = document.createElement('div');
        footer.classList.add('footer');

        let language = document.createElement('span');
        let languageTxt = document.createTextNode(repo.language || '');
        language.appendChild(languageTxt);
        language.classList.add('repo-language');
        footer.appendChild(language);

        el.appendChild(footer);
        div.appendChild(el);
        
        // monta array de linguages;
        let l = repo.language || 'Undefined'; 
        if(languages.hasOwnProperty(l)) {
            languages[l] += 1;
        } else {
            languages[l] = 1;
        };    
    };
    document.getElementById('user-git').appendChild(div);
    elipseDesc();

    // monta a relação de linguagens
    let ldiv = document.createElement('div');
    ldiv.classList.add('projects');
    let title = document.createElement('span');
    let titleTxt = document.createTextNode('Projetos');
    title.appendChild(titleTxt);
    title.classList.add('projects-title');
    ldiv.appendChild(title);
    let a = document.createElement('a');
    let aTxt = document.createTextNode(`Todos [${repos.length}]`);
    a.appendChild(aTxt);
    a.setAttribute('href', '#');
    a.setAttribute('data-filter', 'todos');
    ldiv.appendChild(a);

    for(l of Object.keys(languages).sort()) {
        let a = document.createElement('a');
        let aTxt = document.createTextNode(`${l} [${languages[l]}]`);
        a.appendChild(aTxt);
        a.setAttribute('href', '#');
        a.setAttribute('data-filter', l);
        ldiv.appendChild(a);

        let o = document.createElement('option');
        let oText = document.createTextNode(l);
        o.appendChild(oText);
        o.setAttribute('value', l);
        select.appendChild(o);
    };
    document.getElementById('user-info').appendChild(ldiv);
    filterReposLink(ldiv);
    filterReposSelect(select);
};

function filterReposLink(links) {
    let lks = links.querySelectorAll('a');
    Array.prototype.forEach.call(lks, lk => {
        lk.addEventListener('click', (e) => {
            e.preventDefault();
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