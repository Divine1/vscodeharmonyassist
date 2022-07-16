// @ts-nocheck
// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.


let htmlelements = {
  mvn : {
    application : "mvn_application",
    execute : "mvn_execute",
  },
  javarun : {
    application : "run_application",
    groupinfo : "run_groupinfo",
    suitename : "run_suitename",
    executionParams : "run_executionParams",
    appid : "run_appid",
    projectname : "run_projectname",
    queueid : "run_queueid",
    runid : "run_runid",
    queueparam : "run_queueparam",
    testsuiteid : "run_testsuiteid",
    browser : "run_browser",
    environment : "run_environment",
    autodefect : "run_autodefect",
    runtrials : "run_runtrials",
    sourceid : "run_sourceid",
    security : "run_security",
    outputrunid : "run_outputrunid",
    execute : "run_execute",
  },
  git : {
    status_execute : "git_status_execute",
    pull_execute : "git_pull_execute",
    commit_execute : "git_commit_execute",
    push_execute : "git_push_execute"
  }

};

(function () {
  const vscode = acquireVsCodeApi();
   
  
  console.log("in javascript main.js")

  console.log("47 mvn_application ",document.getElementById("mvn_application").value)
  console.log("vscode ",vscode);
  let getState=(value)=>{
    if(value){
      return vscode.getState(value);
    }
    else{
      return vscode.getState();
    }
  }
  let setState=(key,value)=>{
    vscode.setState({ 
      ...getState(),
      [key] : value
     });
  }

  window.addEventListener("message",(event)=>{
    console.log("window event message ",event.data);
    if(event.data){
      if(event.data.message== "localdb"){
        let textJSON = JSON.parse(event.data.text);
        console.log(" textJSON ",textJSON)
        for(let key in textJSON){
          setState(key,textJSON[key]);
          document.getElementById(key).value=textJSON[key];
        }
      }
      else if(event.data.message== ""){
        
      }
      else{
        
      }
    }

  });


  let registerEventListener = (type,eventName,callback)=>{
    document.getElementById(eventName)?.addEventListener(type,callback);
  }

  //maven listeners start
  registerEventListener("input",htmlelements.mvn.application,function(){
    setState(htmlelements.mvn.application,this.value);
    vscode.postMessage({
      command : "localdb",
      text : JSON.stringify(getState())
    })
  });
  
  registerEventListener("click",htmlelements.mvn.execute,()=>{
    console.log( ` clicked ${htmlelements.mvn.execute}`)
    console.log("values ",Object.values(htmlelements.mvn));

    // vscode.postMessage({
    //   command : "enquiry",
    //   text : "how are you?"
    // })
    vscode.postMessage({
      command : "vscodecommand:buildMaven",
      text : "mvn -version"
    })
    
  });
  

  //maven listeners end

  //java run listeners start
  let javarun_all = Object.values(htmlelements.javarun);
  javarun_all.splice(javarun_all.indexOf(htmlelements.javarun.execute),1);
  let javarun_exclude_execute = javarun_all;
  console.log("javarun_exclude_execute ",javarun_exclude_execute)

  javarun_exclude_execute.forEach(elementId=>{
    registerEventListener("input",elementId,function(){
      setState(elementId,this.value);
      console.log(" getState() ",getState())
      vscode.postMessage({
        command : "localdb",
        text : JSON.stringify(getState())
      })

    })
  })


  registerEventListener("click",htmlelements.javarun.execute,function(){
    console.log( ` clicked ${htmlelements.javarun.execute}`)
    console.log("javarun_exclude_execute ",javarun_exclude_execute);
  })
  
  //java run listeners end

  //git listeners start

  registerEventListener("click",htmlelements.git.status_execute,function(){
    console.log( ` clicked ${htmlelements.git.status_execute}`)
  })
  registerEventListener("click",htmlelements.git.pull_execute,function(){
    console.log( ` clicked ${htmlelements.git.pull_execute}`)
  })
  registerEventListener("click",htmlelements.git.commit_execute,function(){
    console.log( ` clicked ${htmlelements.git.commit_execute}`)
  })
  registerEventListener("click",htmlelements.git.push_execute,function(){
    console.log( ` clicked ${htmlelements.git.push_execute}`)
  })

  //git listeners end

}());
