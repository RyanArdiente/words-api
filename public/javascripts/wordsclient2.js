window.addEventListener("load", function(){
var countField = document.getElementById("countWord");
var countDisplay = document.getElementById("displayCount");
var casesensitivity = document.getElementById("casesensitivity");
var wordcreate = document.getElementById("wordcreate");
var wordedit = document.getElementById("wordedit");
var worddelete = document.getElementById("worddelete");
var twe = document.getElementById("twitterfeed");

countField.addEventListener("keyup", function(evt){
var abbrev = countField.value;
var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() {
if (xhr.readyState == 4 && xhr.status == 200){
// var resp = JSON.parse(xhr.responseText);
// countDisplay.innerHTML = "<li>" + resp.count + " words match "+ resp.abbrev + "</li>";
var resp = xhr.response;
countDisplay.innerHTML = "";
for (var i=0; i<resp.length; i++) {
var item = document.createElement("li");
item.innerHTML = resp[i].count + " words match " + resp[i].abbrev;
       countDisplay.appendChild(item);
    }
}
 }
xhr.open("GET", "/wordsapi/v2/count/" + abbrev+"/searchsensitivity/" + casesensitivity.checked);

xhr.responseType = 'json';
xhr.send();
});
var searchField = document.getElementById("searchWord");
var searchList = document.getElementById("wordlist");
var casesensitivity = document.getElementById("casesensitivity");
searchField.addEventListener("keyup", function(evt){
  wordcreate.type="hidden";
  wordedit.type="hidden";
  worddelete.type="hidden";
  wordcreate.removeEventListener("click",createwordevent)
  wordedit.removeEventListener("click", editwordevent)
  worddelete.removeEventListener("click",deletewordevent)
var abbrev = searchField.value;

var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() {
if (xhr.readyState == 4 && xhr.status == 200){
  var showCreate = true;
   searchList.innerHTML = "";
for (var i=0; i<xhr.response.length; i++) {
var opt = document.createElement("option");
 opt.value = xhr.response[i].id;
  opt.label = xhr.response[i].word;
  opt.innerHTML = xhr.response[i].word;
   searchList.appendChild(opt);
   if(xhr.response[i].word === searchWord.value){
     showCreate = false;
   }
}
if(showCreate === true)
{
  wordcreate.type="button";
  wordcreate.addEventListener("click",createwordevent)
}
else{
  wordedit.type="button";
  wordedit.addEventListener("click", editwordevent)
  worddelete.type="button";
  worddelete.addEventListener("click", deletewordevent);
}
}
}
var uri = "/wordsapi/v2/search/" + abbrev + "/searchsensitivity/" + casesensitivity.checked;
var thresh = searchField.dataset.threshold;
 if (thresh && Number(thresh) > 0) {
uri += "?threshold=" + Number(thresh);
}
xhr.open("GET", uri);
xhr.responseType = 'json';
xhr.send();
});
 //Word search keyup callback
 searchList.addEventListener("change",function(){
   searchField.value = searchList.options[searchList.selectedIndex].label;

   originalWord.innerHTML=searchList.options[searchList.selectedIndex].label;
   ogwordid.innerHTML = searchList.options[searchList.selectedIndex].value;
   changeword.value=searchList.options[searchList.selectedIndex].label;
   searchforword();
 })


});
var searchforword = function(){
  var xhrc = new XMLHttpRequest();
  var uric = "/wordsapi/v2/dictionary/"+ogwordid.innerHTML + "/";
  var jsonword = {"word":changeword.value};
  var json = JSON.stringify(jsonword)
  xhrc.onreadystatechange = function(){
    if(xhrc.status == 200){
      showTweets(xhrc.response.twitter);
    }
    else{

    }
  }
    xhrc.open("GET", uric);
    xhrc.responseType = 'json';
   xhrc.setRequestHeader("Content-type", "application/json");
   xhrc.send(json);

}
var showTweets = function(tweets){
  var tweetlist = tweets.statuses;
  twitterfeed.innerHTML = "";
  for (var i = 0; i < tweetlist.length; i++) {
    twitterfeed.innerHTML+=tweetlist[i].text+"</br>";
  }
}
var editwordevent = function(){
  var xhrc = new XMLHttpRequest();
  var uric = "/wordsapi/v2/dictionary/"+ogwordid.innerHTML + "/";
  var jsonword = {"word":changeword.value};
  var json = JSON.stringify(jsonword)
  xhrc.onreadystatechange = function(){}
    xhrc.open("PUT", uric);
    xhrc.responseType = 'json';
   xhrc.setRequestHeader("Content-type", "application/json");
   xhrc.send(json);
}
var deletewordevent = function(){
  var xhrc = new XMLHttpRequest();
  var uric = "/wordsapi/v2/dictionary/"+ogwordid.innerHTML+"/";
  xhrc.onreadystatechange = function(){
  }
    xhrc.open("DELETE", uric);
    xhrc.responseType = 'json';
   xhrc.send();
};
var createwordevent =  function(){
  var xhrc = new XMLHttpRequest();
  var uric = "/wordsapi/v2/dictionary/";
  var jsonword = {"word":searchWord.value};
  var json = JSON.stringify(jsonword)
  xhrc.onreadystatechange = function(){
  }
    xhrc.open("POST", uric);
    xhrc.responseType = 'json';
   xhrc.setRequestHeader("Content-type", "application/json");
   xhrc.send(json);
};
