var user_id = -1;

//setup chart stuff
Chart.defaults.global.tooltips.enabled = false;
Chart.defaults.global.layout.padding.bottom = -9;
Chart.defaults.global.layout.padding.left = -10;
Chart.defaults.global.layout.padding.top = 1;

window.onload = function ()
{ 
  user_id_field = document.getElementById('user-id');
  user_id = getCookie('user_id');
  if (user_id != -1)
  {
    user_id_field.value = user_id;
    setCookie('user_id', user_id, 30);
  }
  
  match_id = findGetParameter('m');
  if (match_id != null)
    document.getElementById('match-id').value = match_id;
}

window.onpopstate = function (event)
{
  var state = event.state;
  if (state != null && state.m != undefined)
    document.getElementById('match-id').value = state.m;
}
  

function updateURL(match_id)
{
  path = window.location.pathname;
  path = path[path.length - 1] == '/' ? path.substring(0,path.length-1) : path;
  history.pushState({ m: match_id }, 'Lowprioritize' + match_id, path + '/?m=' + match_id);
  document.getElementById('match-id').value = match_id;
}

$(window).on('popstate', function(event) {
    var state = event.originalEvent.state;
    
    if (state) {
        selectColor( state.selectedColor );
    }
    
    updateUrlBar();
});

  
function checkLatest()
{
  prepareDOM();
  getLatestMatchID(user_id).then(function (matches) {
    if (matches.length != 0)
      parseMatch(matches[0].match_id);
    else
      document.getElementById('status-div').innerText = 'error retrieving user matches (ID incorrect or data sharing disabled?)';
  }, e => document.getElementById('status-div').innerText = 'error retrieving user: ' + e.message);
}

function checkCustom()
{
  match_id = document.getElementById('match-id').value;
  prepareDOM();
  parseMatch(match_id);
}

//analyze match, reset the DOM and pop in he new data
function parseMatch(match_id)
{
  updateURL(match_id);
  //get match, its players, their matches -> produce a table from the data
  getMatch(match_id).then(match => Promise.all(match.players.map(player => Promise.all([player, getPlayerMatches(player.account_id, 50)]))).then(players_and_matches => analysePlayers(players_and_matches, match_id))).catch(e => document.getElementById('status-div').innerText = 'error retrieving match: ' + e.responseJSON.error);

}

function analysePlayers(players_and_matches, match_id)
{
  var table_body = document.createElement('tbody');

  table_body.innerHTML += '<tr><th></th><th style=\"text-align:left\">Player</th><th>10</th><th>25</th><th>50</th><th>50 match distribution</th></tr>';

  players_and_matches.forEach(function ([player, matches], p_index) {
    var row = document.createElement('tr');
    var player_name = document.createElement('td');
    player_name.align = 'left';
    
    if (player.account_id != null)
      player_name.innerHTML = '<a target = "_blank" href="https://www.opendota.com/players/' + player.account_id + '">' + player.personaname + '</a>';
    else
      return;

    if (matches.length == 0)
     return;
    
    table_body.appendChild(row);
    
    var hero = document.createElement('td');
    hero_img = document.createElement('img');
    hero_img.align = 'center';
    hero_img.src = 'http://cdn.dota2.com/apps/dota2/images/heroes/'+ heroes[player.hero_id] + '_sb.png';
    hero_img.height = 25;
    
    hero.appendChild(hero_img);
    row.appendChild(hero);
    row.appendChild(player_name);
    
    var l10 = document.createElement('td');
    row.appendChild(l10);
    var l25 = document.createElement('td');
    row.appendChild(l25);
    var l50 = document.createElement('td');
    row.appendChild(l50);
    
    l10.innerHTML = matches.slice(0, 10).reduce((sum, m) => sum + (m.game_mode == 4 ? 1 : 0), 0);
    l25.innerHTML = matches.slice(0, 25).reduce((sum, m) => sum + (m.game_mode == 4 ? 1 : 0), 0);
    l50.innerHTML = matches.reduce((sum, m) => sum + (m.game_mode == 4 ? 1 : 0), 0);

    canvas = document.createElement("canvas");
    canvas.height = 25;
    canvas.width = 300;
    
    var graph = document.createElement('td');
    row.appendChild(graph);
    
    graph.appendChild(canvas);
    
    ctx = canvas.getContext("2d");
    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Array.apply(null, {length: 50}).map(Number.call, Number),
        datasets: [{
          data: matches.map((m) => (m.game_mode == 4 ? 1 : 0)),
          backgroundColor: '#666666'
        }]
      },
      options: {
        responsive: false,
        scales:
        {
          xAxes: [{
            ticks: {
              display: false
            }
          }],
          yAxes: [{
            ticks: {
              display: false,
              suggestedMin: 0
            },
            gridLines: {
                  lineWidth: 0
              }
          }]
        },
        legend: {
          display: false,
        }
      }
    });
    
    return;
  });
  showData(table_body, match_id);
}

function prepareDOM()
{
  var status_display = document.getElementById('status-div');
  status_display.innerText = 'loading match..';
  var table = document.getElementById('data-table');
  
  cNode = table.cloneNode(false);
  table.parentNode.replaceChild(cNode, table);
  
  var table = document.getElementById('data-table');
  table.style.display = 'none';
}

function showData(table_body, match_id)
{
  document.getElementById('status-div').innerText = '';
  var table = document.getElementById('data-table');
  var caption = document.createElement('caption');
  caption.innerText = 'Recent Single Draft Matches of Players in Match ';
  table.appendChild(caption);
  table.appendChild(table_body);

  match_link = document.createElement('a');
  match_link.href = 'https://www.opendota.com/matches/' + match_id;
  match_link.target = '_blank';
  match_link.innerText = match_id;
  caption.append(match_link);
  table.style.display = 'table';
}


function changeUserID()
{
  user_id = document.getElementById('user-id').value;
  //looks like this is called on reload too, check so as to not save ""
  if (user_id != "")
    setCookie('user_id', user_id, 30);
}

