// @ts-nocheck
// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.


let htmlelements = {
  projectDir : {
    projectDir : "projectDir"
  },
  mvn : {
    application : "mvn_application",
    execute : "mvn_execute",
  },
  javarun : {
    appname : "run_appname",
    groupinfo : "run_groupinfo",
    suitename : "run_suitename",
    executionParams : "run_ExecutionParams",
    appid : "run_appid",
    projectname : "run_projectname",
    queueid : "run_queueid",
    runid : "run_RunId",
    queueparam : "run_QueueParam",
    testsuiteid : "run_testsuiteid",
    browser : "run_browser",
    environment : "run_environment",
    autodefect : "run_autodefect",
    runtrials : "run_runTrials",
    sourceid : "run_SourceId",
    security : "run_security",
    outputrunid : "run_outputRunId",
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

  let javarun_all = Object.values(htmlelements.javarun);
  javarun_all.splice(javarun_all.indexOf(htmlelements.javarun.execute),1);
  let javarun_exclude_execute = javarun_all;
  console.log("javarun_exclude_execute ",javarun_exclude_execute)
  
  

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

  //set defaultvalues for javaRun start 
  let setDefaultValues = ()=>{
    document.getElementById(htmlelements.projectDir.projectDir).value="";
    
    document.getElementById(htmlelements.mvn.application).value="vTAPRegression";
    
    document.getElementById(htmlelements.javarun.appname).value="vTAPRegression";
    document.getElementById(htmlelements.javarun.groupinfo).value="mdngroup1";
    document.getElementById(htmlelements.javarun.suitename).value="mdngrouprestrictionts";
    document.getElementById(htmlelements.javarun.executionParams).value="codeCoverage:yes";
    document.getElementById(htmlelements.javarun.appid).value="827";
    document.getElementById(htmlelements.javarun.projectname).value="TAP";
    document.getElementById(htmlelements.javarun.queueid).value="13471";
    document.getElementById(htmlelements.javarun.runid).value="1";
    document.getElementById(htmlelements.javarun.queueparam).value="0";
    document.getElementById(htmlelements.javarun.testsuiteid).value="51695";
    document.getElementById(htmlelements.javarun.browser).value="CHROME";
    document.getElementById(htmlelements.javarun.environment).value="STAGE";
    document.getElementById(htmlelements.javarun.autodefect).value="0";
    document.getElementById(htmlelements.javarun.runtrials).value="1";
    document.getElementById(htmlelements.javarun.sourceid).value="1";
    document.getElementById(htmlelements.javarun.security).value="null";
    document.getElementById(htmlelements.javarun.outputrunid).value="0";
  }
  //set defaultvalues for javaRun end

  

  // receive data from vscode core  start
  window.addEventListener("message",(event)=>{
    console.log("window event message ",event.data);
    if(event.data){
      if(event.data.message== "localdb"){
        let textJSON = JSON.parse(event.data.text);
        console.log(" textJSON ",textJSON)
        for(let key in textJSON){
          console.log("106 key ",key)
          setState(key,textJSON[key]);
          document.getElementById(key).value=textJSON[key];
        }
      }
      else if(event.data.message== "localdbEmpty"){
        setDefaultValues()
        javarun_exclude_execute.forEach(elementId=>{
          let value = document.getElementById(elementId).value;
          setState(elementId,value);
        });
        vscode.postMessage({
          command : "localdb",
          text : JSON.stringify(getState())
        });
      }
      else{
        
      }
    }
  });
  // receive data from vscode core  end



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
    vscode.postMessage({
      command : "vscodecommand:buildMaven",
      text : "mvn clean -version"
    })
    
  });
  

  //maven listeners end

  //java run listeners start
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

    for(let key in getState()){
      console.log("key ",key)
    }

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
