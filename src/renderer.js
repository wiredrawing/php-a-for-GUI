// const setButton = document.getElementById('btn')
// const titleInput = document.getElementById('title')
// setButton.addEventListener('click', () => {
//   const title = titleInput.value
//   window.electronAPI.setTitle(title)
// })


// // メール送信ボタン
// const sendEmailButton = document.getElementById('send-email')

// console.log(sendEmailButton)
//
// sendEmailButton.addEventListener('click', () => {
//   // メッセージボックスの値を取得
//   const message = document.getElementById('email-message').value
//   const title = document.getElementById('email-title').value
//   alert(message);
//   const packet = {
//     message: message,
//     title: title
//   }
//   const response = window.electronAPI.sendEmail(packet)
//   window.electronAPI.anything();
//
// });


// const toMainProcess = document.getElementById("to-main-process");
// console.log(toMainProcess);
// // 入力内容が変更されたら、メインプロセスに通知する
// toMainProcess.addEventListener("keyup", (e) => {
//   window.electronAPI.toMainProcess(e.target.value).then(function (data) {
//     const responseDom = document.getElementById("response");
//     responseDom.textContent = data;
//   }).catch(function (err) {
//     console.log(err);
//   });
// });

const phpMessage = document.getElementById("php");
const responseDom = document.getElementById("php-response");
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


const phpFile = document.getElementById("selectPHPExecutable");
phpFile.addEventListener("click", (e) => {
  console.log(e);
  console.log(e.target);
  console.log(e.target.value);
  window.electronAPI.selectPHPExecutable().then(function (data) {
    console.log("data ===> ", data, "<=== end data");
  }).catch(function(error) {
    console.log("Error: ", error);
  });
});


const selectCwd = document.getElementById("selectCwd");
selectCwd.addEventListener("click", (e) => {
  console.log(e);
  console.log(e.target);
  console.log(e.target.value);
  window.electronAPI.selectCwd().then(function (data) {
    console.log("data ===> ", data, "<=== end data");
  }).catch(function(error) {
    console.log("Error: ", error);
  });
});
