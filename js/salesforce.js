(function(window, document) {
  var support_chat = document.getElementById('support_chat');

  if (typeof(window.__ALC_Badges) === 'undefined') {
    window.__ALC_Badges = [];
  }

  window.__ALC_Deployment = '9668';
  window.__ALC_BADGE_SUFFIX = (Math.round(Math.random() * 10000000000));
  window.__ALC_BUTTON = {};
  window.__ALC_BUTTON.id = '15018';
  window.__ALC_BUTTON.available = '__ALC_BADGE_ONLINE' + window.__ALC_BADGE_SUFFIX;
  window.__ALC_BUTTON.unavailable = '__ALC_BADGE_OFFLINE' + window.__ALC_BADGE_SUFFIX;
  window.__ALC_BUTTON.department = 0;

  if (document.cookie.match('hpcloud_session')) {
    window.__ALC_BUTTON.id = '15220';
  }
  else {
    window.__ALC_BUTTON.id = '15219';
  }

  window.__ALC_Badges.push(window.__ALC_BUTTON);

  var chat_link_online = document.createElement('a');
  chat_link_online.href = '#support_chat';
  chat_link_online.id = window.__ALC_BUTTON.available;
  chat_link_online.className = 'chat_on';
  chat_link_online.style.display = 'none';
  chat_link_online.innerHTML = '<span>Chat</span>';
  chat_link_online.onclick = function() {
    _alc.startChat(window.__ALC_BUTTON.id);
    return false;
  };

  support_chat.appendChild(chat_link_online);

// Pass in window, document.
})(this, this.document);