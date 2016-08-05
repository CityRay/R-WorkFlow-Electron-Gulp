import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './Home.css';
import { remote, ipcRenderer } from 'electron';
import * as child from 'child_process';
import kill from 'tree-kill';


export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      gpath: 'Choice Folder...',
      logger: '',
      server: false,
      projectIsOpen: false
    };

    this.process = null;
    this.onOpenDir = this.onOpenDir.bind(this);
    this.onCreateProject = this.onCreateProject.bind(this);
    this.onGulp = this.onGulp.bind(this);
    this.onKill = this.onKill.bind(this);

  }

  componentDidMount() {

  }

  formatString(str) {
    const reg = /[\n|\r]/g;
    const nstr = str.replace(reg, "<br />");
    return {__html: nstr};
  }

  onCreateProject() {
    // console.log(remote.app.getAppPath());
    // console.log(process.env.NODE_ENV);

    if (process.env.NODE_ENV === 'development') {
      this.process = child.exec(`npm run create-project -- --cpath ${this.state.gpath}`,(error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          this.setState({
            projectIsOpen: false,
            logger: this.state.logger + '\n' + error + '\n' + remote.app.getAppPath()
          });
          return;
        }
        console.log(`stdout: ${stdout}`);
        // console.log(`stderr: ${stderr}`);

        this.setState({
          projectIsOpen: true,
          logger: stdout + '\n' + stderr
        });
      });
    } else {
      this.process = child.exec(`npm run create-project -- --cpath ${this.state.gpath}`, {
        env: {"ATOM_SHELL_INTERNAL_RUN_AS_NODE":0},
        cwd:remote.app.getAppPath()
      },(error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          this.setState({
            projectIsOpen: false,
            logger: this.state.logger + '\n' + error + '\n' + remote.app.getAppPath()
          });
          return;
        }
        console.log(`stdout: ${stdout}`);
        // console.log(`stderr: ${stderr}`);

        this.setState({
          projectIsOpen: true,
          logger: stdout + '\n' + stderr
        });
      });
    }

  }

  onOpenDir() {
    const {dialog} = require('electron').remote;
    let path = dialog.showOpenDialog({
        properties: ['openDirectory']
    }, (d) => {
      console.log(d);

      this.setState({
        gpath: d[0]
      });
    });
  }

  onGulp() {
    // const exec = require('child_process').exec;
    const cwd = remote.app.getAppPath();
    // const spawn = require('child_process').spawn;
    // const ls = spawn('ls', ['-lh', '/usr']);

    // console.log(__dirname);

    if (process.env.NODE_ENV === 'development') {
      this.process = child.exec(`npm run build-developing -- --cwd ${this.state.gpath}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
      });

    } else {
      this.process = child.exec(`npm run build-developing -- --cwd ${this.state.gpath}`, {
        env: {"ATOM_SHELL_INTERNAL_RUN_AS_NODE":0},
        cwd:remote.app.getAppPath()
      }, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        // console.log(`stdout: ${stdout}`);
        // console.log(`stderr: ${stderr}`);
      });
    }


    this.process.stdout.on('data', (data) => {
      console.log(data);
      this.setState({
        logger: this.state.logger + '\n' + data
      });
    });

    this.process.on('close', function(code) {
      console.log('closing code: ' + code);
    });

    console.log(this.process.pid);
    ipcRenderer.send('process-child-id', this.process.pid);
  }

  onKill() {
    console.log('kill');
    try {
      kill(this.process.pid);
      ipcRenderer.send('process-child-id', 0);
      this.setState({
        logger: 'Project Closed'
      });
    }
    catch (ex) { }
  }

  render() {
    return (
      <div>
        <div className={styles.container}>
          <h2>R WorkFlow</h2>
          <button onClick={this.onOpenDir}>選擇專案位置</button>
          <button onClick={this.onCreateProject}>創建專案</button>
          <div />

          {this.state.projectIsOpen ?
            <div>
              <button onClick={this.onGulp}>開始開發</button>
              <button onClick={this.onKill}>結束開發</button>
            </div> : null
          }

          <h4>路徑： {this.state.gpath}</h4>
          <div
            className={styles.logger}
          >
            <div dangerouslySetInnerHTML={this.formatString(this.state.logger)}
            >
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// <Link to="/counter">to Counter</Link>
