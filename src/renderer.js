

const phpMessage = document.getElementById("php");
const responseDom = document.getElementById("php-response");
// 一時ソースを保存するボタン
const saveTempSource = document.getElementById("save-temp-source");
phpMessage.addEventListener("keyup", (e) => {
  if (e.key !== "Enter" || e.ctrlKey) {
    return false;
  }
  responseDom.innerHTML = ""
  window.electronAPI.executePHP(e.target.value).then(function (data) {
    console.log("data ===> ", data, "<=== end data");
    if (data["stdout"]) {
      responseDom.innerHTML = data["stdout"]
      responseDom.classList.remove('error') //hideという要素をinfoのクラスに追加する
    } else {
      if (data["stderr"]) {
        responseDom.innerHTML = data["stderr"]
        if (!responseDom.classList.contains('error')) { ////hideという要素がinfoにない場合に実行する。そうしないとたくさん追加されるため
          responseDom.classList.add('error') //hideという要素をinfoのクラスに追加する
        }
      }
    }
    const scrollTarget = document.getElementById("php-response");
    scrollTarget.scrollTop = scrollTarget.scrollHeight;
    return true
  }).catch(error => {
    console.log("Renderer error ===> ", error, "<== End Renderer Error");
    if (!responseDom.classList.contains("error")) {
      responseDom.classList.add('error') //hideという要素をinfoのクラスに追加する]
    }

    responseDom.innerHTML = ">>>>" + error.message;
    return false;
  })
});


saveTempSource.addEventListener("click", function (e) {
  let sourceData  = document.getElementById("php").value;
  const cwd = document.getElementById("current-working-directory");
  if (cwd.innerHTML === "") {
    console.log("作業ディレクトリが設定されていない場合は一時保存できません。");
    window.electronAPI.showNotificationMessage("作業ディレクトリが設定されていません。").then(function (data) {
      document.getElementById("php").focus();
      return true;
    }).catch(function (error) {
      console.log("Error: ", error);
      return false;
    });
  } else {
    window.electronAPI.saveTempSource(sourceData).then(function (isSaved) {
      return true;
    }).catch(error => {
      return false;
    })
  }
});


// const phpFile = document.getElementById("selectPHPExecutable");
// phpFile.addEventListener("click", (e) => {
//   console.log(e);
//   console.log(e.target);
//   console.log(e.target.value);
//   window.electronAPI.selectPHPExecutable().then(function (data) {
//     console.log("data ===> ", data, "<=== end data");
//   }).catch(function(error) {
//     console.log("Error: ", error);
//   });
// });


// const selectCwd = document.getElementById("selectCwd");
// selectCwd.addEventListener("click", (e) => {
//   console.log(e);
//   console.log(e.target);
//   console.log(e.target.value);
//   window.electronAPI.selectCwd().then(function (data) {
//     console.log("data ===> ", data, "<=== end data");
//   }).catch(function(error) {
//     console.log("Error: ", error);
//   });
// });


// メインプロセスからの通知を常に監視してくれる
const currentPHPVersion = document.getElementById("current-php-version");
window.electronAPI.completedSelectingPHPExecutable(function(e, path ){
  currentPHPVersion.innerHTML = path;
});

const currentCwd = document.getElementById("current-working-directory");
window.electronAPI.completedSelectingCwd(function(e, path ) {
  currentCwd.innerHTML = path;
});
