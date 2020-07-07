import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import * as retargetEvents from 'react-shadow-dom-retarget-events';
import styles from './color.scss';

const ReactApp = ({ user }) => {
  const [count, setCount] = React.useState(0);
  const [likeType, setLikeType] = React.useState('EVEN');
  React.useEffect(() => {
    if (count % 2 === 0) {
      setLikeType('EVEN');
    } else {
      setLikeType('ODD');
    }
  }, [count]);

  return (
    <div>
      <slot name='user' /> {user}
      <br />
      LIKES : {count}
      <br />
      <p>The likes are {likeType}</p>
      <a href='#'>Dummy Link</a> <br />
      <button
        className='green'
        onClick={() => {
          setCount((prevCount) => prevCount + 1);
        }}
      >
        👍 LIKE
      </button>
    </div>
  );
};

const styleGreen = document.createElement('style');
styleGreen.type = 'text/css';
styleGreen.appendChild(document.createTextNode(styles));
//Constructable StyleSheet
//const sheet = new CSSStyleSheet();
//sheet.replaceSync(document.createTextNode(styles));

const template = document.createElement('template');
template.innerHTML = `
    <style>
        .user-card {
            font-family: Helvetica, Arial, sans-serif;
            background: #f4f4f4;
            width: 500px;
            display: grid;
            grid-template-columns: 1fr 2fr;
            grid-gap: 10px;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 5px solid darkorchid;
        }
    
        .user-card img {
            width: 100%;
            margin: auto 1rem;
        }
    
        .user-card button {
            cursor: pointer;
            background: darkorchid;
            color: #fff;
            border: 0;
            border-radius: 5px;
            padding: 5px 10px;
        }
    </style>
    <div class="user-card">
    <img />
    <div>
      <h3></h3>
      <div id="app">
</div>
      <div class="info">
        <p>EMAIL: <slot name="email" /></p>
        <p>PHONE: <slot name="phone" /></p>
      </div>
      <button id="toggle-info">Hide Info</button>
    </div>
  </div>
  `;

class CustomDashboard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.shadowRoot.appendChild(styleGreen);
    //this.shadowRoot.adoptedStyleSheets = [sheet];
  }

  toggleInfo() {
    this.showInfo = !this.showInfo;

    const info = this.shadowRoot.querySelector('.info');
    const toggleBtn = this.shadowRoot.querySelector('#toggle-info');

    if (this.showInfo) {
      info.style.display = 'block';
      toggleBtn.innerText = 'Hide Info';
    } else {
      info.style.display = 'none';
      toggleBtn.innerText = 'Show Info';
    }
  }

  static get observedAttributes() {
    return ['user'];
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    if (newValue !== oldValue) {
      switch (attrName) {
        /** Value attributes */
        case 'user':
          this[attrName] = newValue;
          this.mountReactApp();
          break;
        default:
          break;
      }
    }
  }

  mountReactApp() {
    if (!this.mountPoint) {
      this.mountPoint = this.shadowRoot.querySelector('#app');
    }
    ReactDOM.render(
      <ReactApp user={this.getAttribute('user')} />,
      this.mountPoint
    );
  }

  connectedCallback() {
    this.shadowRoot.querySelector('h3').innerText = this.getAttribute('name');
    this.shadowRoot.querySelector('img').src = this.getAttribute('avatar');

    this.mountPoint = this.shadowRoot.querySelector('#app');
    this.shadowRoot
      .querySelector('#toggle-info')
      .addEventListener('click', () => this.toggleInfo());
    this.mountReactApp();
    retargetEvents(this.shadowRoot);
  }

  disconnectedCallback() {
    this.shadowRoot.querySelector('#toggle-info').removeEventListener();
  }
}

if (!window.customElements.get('custom-dashboard')) {
  window.customElements.define('custom-dashboard', CustomDashboard);
}
