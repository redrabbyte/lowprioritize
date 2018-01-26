var user_id = -1;

$.ajax({url: 'http://www.ginerlukas.com/visitors.php'});

window.onload = function ()
{ 
  user_id_field = document.getElementById('user-id');
  user_id = getCookie('user_id');
  if (user_id != -1)
  {
    user_id_field.value = user_id;
    setCookie('user_id', user_id, 30);
  }
}
  
  
function checkLatest()
{
  match_id = getLatestMatchID(user_id);
  checkMatch(match_id);
}

function checkCustom()
{
  match_id = document.getElementById('match-id').value;
  checkMatch(match_id);
}

function checkMatch(match_id)
{
  var status_display = document.getElementById('status-div');
  status_display.innerText = 'loading match..';
  var table = document.getElementById('data-table');
  
  cNode = table.cloneNode(false);
  table.parentNode.replaceChild(cNode, table);
  
  var table = document.getElementById('data-table');
  table.style.display = 'none';
  
  var table_body = analyzeMatch(match_id);
  var caption = document.createElement('caption');
  caption.innerText = 'Recent Single Draft Matches of Players in Match ';
  table.appendChild(caption);
  table.appendChild(table_body);
  
  status_display.innerText = '';
  match_link = document.createElement('a');
  match_link.href = 'https://www.opendota.com/matches/' + match_id;
  match_link.target = '_blank';
  match_link.innerText = match_id;
  caption.append(match_link);
  table.style.display = 'table';
}

function changeUserID()
{
  setCookie('user_id', document.getElementById('user-id').value, 30);
}

function analyzeMatch(match_id)
{
  
  var players = getPlayers(match_id);

  Chart.defaults.global.tooltips.enabled = false;
  Chart.defaults.global.layout.padding.bottom = -9;
  Chart.defaults.global.layout.padding.left = -10;
  Chart.defaults.global.layout.padding.top = 1;
  
  var table_body = document.createElement('tbody');
  
  table_body.innerHTML += '<tr bgcolor=\"#9acd32\"><th></th><th style=\"text-align:left\">Player</th><th>10</th><th>25</th><th>50</th><th>50 match distribution</th></tr>';
  charts = [];

  players.forEach(function (player, p_index) {
    var row = document.createElement('tr');
    var player_name = document.createElement('td');
    player_name.align = 'left';
    
    if (player.account_id != null)
      player_name.innerHTML = '<a target = "_blank" href="https://www.opendota.com/players/' + player.account_id + '">' + player.personaname + '</a>';
    else
      return;

    matches = getPlayerMatches(player.account_id, 50);
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
    charts[p_index] = new Chart(ctx, {
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

  return table_body;
}
