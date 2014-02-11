function isUserCached(user){
    if (localStorage[user]!=undefined){
        var cache = JSON.parse(localStorage[user]);
        var time = cache.time;
        if (new Date().getTime()-time<86400000){
            return cache;
        }
    }
    return false;
}

function repoInfoListener(e, repos){
    var repoInfo = (repos===undefined)?JSON.parse(this.responseText):JSON.parse(repos);
    var res="";
    if (repoInfo.length==0){
        res="<div>Публичных репозиториев не найдено.</div>";
    }else{
        for (var i=0;i<repoInfo.length;i++){
            res+='<a target="_blank" href="'+repoInfo[i].html_url+'" class="repo fork-'+repoInfo[i].fork+'">'+repoInfo[i].name+'</a> ';
        }
    }
    document.querySelector("#user .repos").innerHTML=res;
    if (repos===undefined){
        var cache = {
            "user": sessionStorage["ajaxLoadingUser"],
            "time": new Date().getTime(),
            "info": sessionStorage["ajaxLoading"],
            "repos": this.responseText
        };
        localStorage[cache.user]= JSON.stringify(cache);
    }
}

function userInfoListener (e, info) {
    var userData="";
    if (info===undefined){
        if (this.status==200){
            userData = JSON.parse(this.responseText);
        }
        else{
            var res="<span class='warning'>Ошибка: пользователь <strong>"+sessionStorage["ajaxLoadingUser"]+"</strong> не найден!</span>"
            document.querySelector("#user .info").innerHTML=res;
            return;
        }
    }
    else{
        userData = JSON.parse(info);
    }
    var name = userData.name==undefined?'<span class="warning">Имя не опубликовано</span>':userData.name;
    var email = userData.email==undefined?'<span class="warning">E-mail не опубликован</span>':userData.email;
    var res = '<img class="avatar" src="'+userData.avatar_url+'&s=220">'+
            '<h1><span class="fullname">'+name+'</span><span class="username">'+userData.login+'</span></h1>'+
            '<ul><li class="mail">'+email+'</li>' +
            '<li class="followers">'+userData.followers+'</li></ul>';
    document.querySelector("#user .info").innerHTML=res;
    if (info===undefined){
        sessionStorage["ajaxLoading"]=JSON.stringify(userData);
        loadData(sessionStorage["ajaxLoadingUser"]+"/repos",repoInfoListener);
    }
}

function loadData(user,listener){
    var oReq = new XMLHttpRequest();
    oReq.onload = listener;
    oReq.open("get", "https://api.github.com/users/"+user, true);
    oReq.send();
}

function getUserData(event){
    event.preventDefault();
    var user = document.getElementById("user-name").value;
    if (user==""){
        alert("Имя пользователя не введено!");
        return;
    }
    else{
        user = user.replace(/^\s+/, '').replace(/\s+$/, '');
        document.getElementById("user-name").value=user;
    }
    document.querySelector("#user .info").innerHTML="<div class='preroll'></div>";
    document.querySelector("#user .repos").innerHTML="";
    var cache=isUserCached(user);
    if (cache!==false){
        userInfoListener(null,cache.info);
        repoInfoListener(null,cache.repos);
    }
    else{
        sessionStorage["ajaxLoadingUser"]=user;
        loadData(user,userInfoListener);
    }
}
document.querySelector(".button").addEventListener("click",getUserData,false);
document.querySelector("#user-name").addEventListener("keypress",function(e){
    if (e.keyCode==13){
        getUserData(e);
    }
},false);
(function helper(){
    var helper="";
    for (var i =0;i<localStorage.length;i++){
        helper+='<option value="'+localStorage.key(i)+'"/>';
    }
    document.getElementById("loadusers").innerHTML=helper;
})();
