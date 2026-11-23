/*jslint onevar: true, undef: false, nomen: true, eqeqeq: true, plusplus: false, bitwise: true, regexp: true, newcap: true, immed: true  */

/**
 * Game of Life - JS & CSS
 * Pedro Verruma (http://pmav.eu)
 * 04 September 2010
 *
 * Major modifications by Charles Reid (https://github.com/charlesreid1)
 * 12 February 2018
 * 11 July 2019
 *
 * Major modifications by Ch4zm of Hellmouth (https://github.com/ch4zm)
 * 26 October 2020
 */

(function () {

  var realBackgroundColor = "#272b30";
  var gridStrokeColor1    = "#3a3a3a";
  var mapZoneStrokeColor  = "#dddddd";
  var grays = ["#303030", "#3f3f3f", "#494949", "#525252", "#5d5d5d"];

  var GOL = {

    // http://www.mirekw.com/ca/rullex_gene.html

    // Conway's Game of Life
    ruleParams : {
      b : [3],
      s : [2, 3],
      tolZero : 1e-8,
      tolStable : 1e-8,
      runningAvgMaxDim: {{cookiecutter.running_avg_max_dim}},
    },


    // Initial Conditions:
    //
    // // Two acorns
    //
    s1Default: '[{"30":[50,51,54,55,56]},{"31":[53]},{"32":[51]}]',
    s2Default: '[{"90":[25]},{"91":[27]},{"92":[24,25,28,29,30]}]',
    //
    // // Crabs
    // s1Default: '[{"43":[119,160]},{"44":[118,120,160,161]},{"45":[119,159,161]},{"46":[122,123]},{"47":[119,122,123,157,158]},{"48":[118,120,125,157,158]},{"49":[120,126,127]},{"50":[118,119,125,126,155,159,160,167]},{"51":[115,118,154,156,158,161,167,168]},{"52":[155,159,161,162,166,168]},{"53":[117,164]},{"54":[115,116,165]},{"55":[118,162,165]},{"56":[119,120]},{"57":[118,119]}]',
    // s2Default: '[{"40":[85]},{"41":[85,86]},{"42":[84,86]},{"44":[82,83]},{"45":[82,83]},{"47":[80,84,85,92]},{"48":[79,81,83,86,92,93]},{"49":[37,80,84,86,87,91,93]},{"50":[36,38,89]},{"51":[37,90]},{"52":[33,34,87,90]},{"53":[33,34,37]},{"54":[31,36,38]},{"55":[29,30,36]},{"56":[30,31,37,38]},{"57":[38,41]},{"59":[39]},{"60":[40,41]},{"61":[38]},{"62":[36,37]},{"63":[37,38]}]',

    // Geometry:
    defaultCols: 240,
    defaultRows: 160,
    defaultCellSize: 3,

    // URLs:
    baseApiUrl : getBaseApiUrl(),
    baseUIUrl : getBaseUIUrl(),
    mapsApiUrl : getMapsApiUrl(),
    // this may duplicate / between the base url and simulator
    baseSimulatorUrl : getBaseUIUrl() + '/simulator/index.html',

    simulatorDivIds : [
      'container-golly-header',
      'container-golly-controls',
      'container-canvas',
      'container-golly-frontmatter',
      'container-loading'
    ],

    // Other params
    gameMode : false,
    mapMode : false,
    sandboxMode : false,

    teamNames: [],
    teamColors: [],

    columns : 0,
    rows : 0,
    cellSize: 0,

    waitTimeMs: 0,
    // Hyper speed: generations run back to back per tick of the run loop
    hyperGenerations: 3,
    generation : 0,

    running : false,
    autoplay : false,

    // Cell colors
    //
    // alive color sets are either set by the game (game mode)
    // or set by the user via the schemes (sandbox mode)
    colors : {

      ncolors: 3,

      currentScheme : 0,

      schedule : false,
      dead: realBackgroundColor,
      trail: grays,

      alive: null,
      aliveLabels: null,

      schemes : [
        {
          aliveLabels: ['Blue', 'Yellow'],
          alive: ['#3b9dff', '#ffc20a'],
        },
        {
          aliveLabels: ['Orange', 'Purple'],
          alive: ['#e66100', '#9963ab'],
        },
        {
          aliveLabels: ['Yellow', 'Red'],
          alive: ['#ffc20a', '#dc3220'],
        },
        {
          aliveLabels: ['Orange', 'Blue'],
          alive:       ['#e66100', '#0c7bdc'],
        },
        {
          aliveLabels: ['Bright', 'Not So Bright'],
          alive: ['#EEEEEE', '#777777'],
        }
      ],
    },

    // Grid style
    grid : {
      current : 1,
      mapOverlay : false,

      schemes : [
        {
          color : gridStrokeColor1,
        },
        {
          color : '', // Special case: 0px grid
        },
      ],
    },

    // information about winner/loser
    showWinnersLosers : false,
    foundVictor : false,
    runningAvgWindow : [],
    runningAvgLast3 : [0.0, 0.0, 0.0],

    // Clear state
    clear : {
      schedule : false
    },

    // Average execution times
    times : {
      algorithm : 0,
      gui : 0
    },

    // DOM elements
    element : {
      generation : null,
      livecells : null,
      livecells1 : null,
      livecells2 : null,
      //livepct: null,

      teamColors: [],
      teamNames: [],
      teamRanks: [],

      team1color: null,
      team1name: null,
      team2color: null,
      team2name: null,

      mapName: null,
      mapPanel: null,
    },

    // Initial state
    // Set in loadConfig()
    initialState1 : null,
    initialState2 : null,

    // Trail state
    trail : {
      current: false,
      schedule : false
    },

    /**
     * On Load Event
     */
    init : function() {
      try {
        this.loading();
        this.listLife.init();   // Reset/init algorithm
        this.loadConfig();      // Load config from URL
        this.keepDOMElements(); // Keep DOM references (getElementsById)
        this.loadState();       // Load state from config
      } catch (e) {
        console.log(e);
        this.error(-1);
      }
    },

    error : function(mode) {

      // Hide elements
      for (var c in this.simulatorDivIds) {
        try {
          var elem = document.getElementById(this.simulatorDivIds[c]);
          elem.classList.add('invisible');
        } catch (e) {
          // do nothing
        }
      }

      // Show error
      var container = document.getElementById('container-error');
      container.classList.remove("invisible");

    },

    loading : function() {
      this.loadingElem = document.getElementById('container-loading');
      this.loadingElem.classList.remove('invisible');
    },

    removeLoadingElem : function() {
      this.loadingElem.classList.add('invisible');
    },

    showControlsElem : function() {
      var controls = document.getElementById('container-golly-controls');
      controls.classList.remove('invisible');
    },

    showGridElem : function() {
      var canv = document.getElementById('container-canvas');
      canv.classList.remove('invisible');
    },

    /**
     * Load config from URL
     *
     * This function loads configuration variables for later processing.
     * Here is how it works:
     * - if user provides gameId param, switch to game simulation mode
     * - if user provides no gameId param, switch to sandbox mode
     *   - if user provides map param, show map display
     *   - if user provides random param, don't show map display
     *   - if user provides s1 or s2 params, don't show map display
     *   - if user provides nothing, don't show map display
     * Any options that require data to be loaded are set elsewhere.
     */
    loadConfig : function() {
      var grid, zoom;

      // User providing gameId means we go to game mode
      this.gameId = this.helpers.getUrlParameter('gameId');

      // User NOT providing gameId means we go to sandbox mode
      // User can provide a map,
      this.patternName = this.helpers.getUrlParameter('patternName');
      // Or specify the random flag,
      this.random = parseInt(this.helpers.getUrlParameter('random'));
      // Or specify the states of the two colors
      this.s1user = this.helpers.getUrlParameter('s1');
      this.s2user = this.helpers.getUrlParameter('s2');

      if (this.gameId != null) {
        // Game simulation mode with map overlay
        this.gameMode = true;
        this.grid.mapOverlay = true;

      } else if (this.patternName != null) {
        // Map mode with map overlay
        this.mapMode = true;
        this.sandboxMode = true;
        this.grid.mapOverlay = true;

      } else if (this.random == 1) {
        // Random map
        this.sandboxMode = true;
        this.grid.mapOverlay = false;

      } else if ((this.s1user != null) || (this.s2user != null)) {
        // User-provided patterns
        this.sandboxMode = true;
        this.grid.mapOverlay = false;

      } else {
        // Default patterns
        this.sandboxMode = true;
        this.grid.mapOverlay = false;

      }

      // Initialize the victor percent running average window array
      var maxDim = this.ruleParams.runningAvgMaxDim;
      // var maxDim = Math.max(2*this.columns, 2*this.rows);
      for (var i = 0; i < maxDim; i++) {
        this.runningAvgWindow[i] = 0;
      }

      // The following configuration/user variables can always be set,
      // regardless of whether in game mode, map mode, or sandbox mode

      // Initial grid config
      grid = parseInt(this.helpers.getUrlParameter('grid'), 10);
      if (isNaN(grid) || grid < 1 || grid > this.grid.schemes.length) {
        grid = 0;
      }
      this.grid.current = 1 - grid;

      // Add ?autoplay=1 to the end of the URL to enable autoplay
      this.autoplay = this.helpers.getUrlParameter('autoplay') === '1' ? true : this.autoplay;

      // Add ?trail=1 to the end of the URL to show trails
      this.trail.current = this.helpers.getUrlParameter('trail') === '1' ? true : this.trail.current;
    },

    /**
     * Load world state from config
     *
     * This method is complicated because it loads the data,
     * and a lot of other actions have to wait for the data
     * to be loaded before they can be completed.
     */
    loadState : function() {

      if (this.gameId != null) {

        // ~~~~~~~~~~ GAME MODE ~~~~~~~~~~

        // Load a game from the /game API endpoint
        let url = this.baseApiUrl + '/game/' + this.gameId;
        fetch(url)
        .then(res => res.json())
        .then((gameApiResult) => {

          // Remove loading message, show controls and grid
          this.removeLoadingElem();
          this.showControlsElem();
          this.showGridElem();

          this.gameApiResult = gameApiResult;

          // Set the game title
          var gameTitleElem = document.getElementById('golly-game-title');
          if (gameApiResult.isPostseason == true) {
            var sp1 = gameApiResult.season + 1;
            gameTitleElem.innerHTML = "Hellmouth {{cookiecutter.upper_shortname}}: " + gameApiResult.description + " <small>- S" + sp1 + "</small>";
          } else {
            var sp1 = gameApiResult.season + 1;
            var dp1 = gameApiResult.day + 1;
            var descr = "Hellmouth {{cookiecutter.upper_shortname}} Cup: Season " + sp1 + " Day " + dp1;
            gameTitleElem.innerHTML = descr;
          }

          // Determine if we know a winner/loser
          if (
            this.gameApiResult.hasOwnProperty('team1Score') &&
            this.gameApiResult.hasOwnProperty('team2Score')
          ) {
            var s1 = this.gameApiResult.team1Score;
            var s2 = this.gameApiResult.team2Score;
            this.showWinnersLosers = true;
            if (s1 > s2) {
              this.whoWon = 1;
            } else {
              this.whoWon = 2;
            }
          }

          this.setTeamNames();
          this.setColors();
          this.drawIcons();

          // Map initial conditions
          this.initialState1 = this.gameApiResult.initialConditions1;
          this.initialState2 = this.gameApiResult.initialConditions2;
          this.columns = this.gameApiResult.columns;
          this.rows = this.gameApiResult.rows;
          this.cellSize = this.gameApiResult.cellSize;
          this.mapName = this.gameApiResult.mapName;

          this.setZoomState();
          this.setInitialState();

          this.updateMapLabels();
          this.updateTeamNamesColors();
          this.updateTeamRecords();
          this.updateGameInitCounts();
          this.updateGameControls();
          this.updateWinLossLabels();

          this.canvas.init();
          this.registerEvents();
          this.prepare()

        })
        .catch(err => {
          this.error(-1);
        });
        // Done loading game from /game API endpoint

      } else if (this.patternName != null) {

        // ~~~~~~~~~~ MAP MODE ~~~~~~~~~~

        // Get user-specified rows/cols, if any
        var rows = this.getRowsFromUrlSafely();
        var cols = this.getColsFromUrlSafely();

        // Load a map from the /map API endpoint
        let url = this.mapsApiUrl + '/map/{{cookiecutter.lower_shortname}}/' + this.patternName + '/r/' + this.getRowsFromUrlSafely() + '/c/' + this.getColsFromUrlSafely();
        fetch(url)
        .then(res => res.json())
        .then((mapApiResult) => {

          // Remove loading message, show controls and grid
          this.removeLoadingElem();
          this.showControlsElem();
          this.showGridElem();

          // Set the game title
          var gameTitleElem = document.getElementById('golly-game-title');
          gameTitleElem.innerHTML = "Hellmouth {{cookiecutter.upper_shortname}}: " + mapApiResult.mapName;

          this.setTeamNames();
          this.setColors();

          // Initial conditions
          this.initialState1 = mapApiResult.initialConditions1;
          this.initialState2 = mapApiResult.initialConditions2;
          this.columns = mapApiResult.columns;
          this.rows = mapApiResult.rows;
          this.cellSize = mapApiResult.cellSize;

          this.mapName = mapApiResult.mapName;

          this.setZoomState();
          this.setInitialState();

          this.updateMapLabels();
          this.updateTeamNamesColors();
          this.updateTeamRecords();
          this.updateGameInitCounts();
          this.updateGameControls();

          this.canvas.init();
          this.registerEvents();
          this.prepare()

        })
        .catch(err => {
          this.error(-1);
        });
        // Done loading pattern from /map API endpoint

      } else {

        // ~~~~~~~~~~ PLAIN OL SANDBOX MODE ~~~~~~~~~~

        this.setTeamNames();
        this.setColors();
        this.setZoomState();

        if ((this.s1user != null) || (this.s2user != null)) {
          if (this.s1user != null) {
            this.initialState1 = this.s1user;
          } else {
            this.initialState1 = [{}];
          }
          if (this.s2user != null) {
            this.initialState2 = this.s2user;
          } else {
            this.initialState2 = [{}];
          }

          // Set the game title
          var gameTitleElem = document.getElementById('golly-game-title');
          gameTitleElem.innerHTML = "Sandbox";

        } else {
          this.initialState1 = this.s1Default;
          this.initialState2 = this.s2Default;

          // Set the game title
          var gameTitleElem = document.getElementById('golly-game-title');
          gameTitleElem.innerHTML = "Sandbox";

        }

        // Remove loading message, show controls and grid
        this.removeLoadingElem();
        this.showControlsElem();
        this.showGridElem();

        this.setInitialState();

        this.updateMapLabels();
        this.updateTeamNamesColors();
        this.updateTeamRecords();
        this.updateGameInitCounts();
        this.updateGameControls();

        this.canvas.init();
        this.registerEvents();
        this.prepare()
      }
    },

    /**
     * Update the Game of Life with initial cell counts/stats.
     */
    updateGameInitCounts : function() {

      // Update live counts for initial state
      this.element.generation.innerHTML = '0';
      var liveCounts = this.getCounts();
      this.updateStatisticsElements(liveCounts);

      // If either cell count is 0 to begin with, disable victory check
      this.zeroStart = false;
      if (liveCounts.liveCells1==0 || liveCounts.liveCells2==0) {
        this.zeroStart = true;
      }

    },

    /**
     * Update the Game of Life scoreboard with winner/loser
     * indicators, if this is a game and we know the score.
     * This is only done once @ beginning when we load state.
     */
    updateWinLossLabels : function() {
      if (this.gameMode === true) {
        // Indicate winner/loser, if we know
        if (this.showWinnersLosers) {
          if (this.whoWon == 1) {
            this.element.team1winner.innerHTML = 'W';
            this.element.team2loser.innerHTML = 'L';
          } else if (this.whoWon == 2) {
            this.element.team2winner.innerHTML = 'W';
            this.element.team1loser.innerHTML = 'L';
          } else {
            // should only be here if already a victor,
            // but the user pressed clear
            this.showWinnersLosers = false;
          }
        }
      }
    },

    /**
     * Update the Game of Life controls depending on what mode we're in.
     */
    updateGameControls : function() {
      if (this.gameMode === true) {
        // In game mode, hide controls that the user won't need
        this.element.clearButton.remove();
      }
    },

    /**
     * Update map labels using loaded map label data
     */
    updateMapLabels : function() {
      if (this.grid.mapOverlay===true) {
        this.element.mapName.innerHTML = this.mapName;
      } else {
        // Remove the Map line from the scoreboard
        this.element.mapPanel.remove();
      }

    },

    /**
     * Set the names of the two teams
     */
    setTeamNames : function() {
      if (this.gameMode === true) {
        // If game mode, get team names from game API result
        this.teamNames = [this.gameApiResult.team1Name, this.gameApiResult.team2Name];
      } else {
        // Use color labels
        this.teamNames = this.colors.schemes[this.colors.currentScheme].aliveLabels;
      }
    },

    /**
     * Set the default color palatte.
     * There is a default set of color pallettes that are colorblind-friendly.
     * In game mode, we insert the two teams' default colors,
     * but still allow folks to cycle through other color schemes.
     */
    setColors : function() {
      if (this.gameMode === true) {

        if (this.gameApiResult.hasOwnProperty('message')) {
          if (this.gameApiResult['message'] === 'Invalid Game ID Error') {
            throw 'Error: invalid game ID';
          }
        }

        // Modify the color schemes available:
        // - insert the teams' original color schemes in front
        // - update the labels for each color scheme to be the team names
        this.colors.schemes.unshift({
          aliveLabels : [this.gameApiResult.team1Name, this.gameApiResult.team2Name],
          alive : [this.gameApiResult.team1Color, this.gameApiResult.team2Color]
        });
        this.colors.currentScheme = 0;
        this.colors.alive = this.colors.schemes[this.colors.currentScheme].alive;

      } else {
        // Parse color options and pick out scheme
        this.colors.currentScheme = 0;

        this.colors.aliveLabels = this.colors.schemes[this.colors.currentScheme].aliveLabels;
        this.colors.alive = this.colors.schemes[this.colors.currentScheme].alive;
      }
    },

    /**
     * Draw the icons for each team.
     * Get data from the /teams endpoint first.
     * Team abbreviation.
     * This is only called when in gameMode.
     */
    drawIcons : function() {

      // Get team abbreviations from /teams endpoint
      // (abbreviations are used to get svg filename)
      let url = this.baseApiUrl + '/teams/' + this.gameApiResult.season;
      fetch(url)
      .then(res => res.json())
      .then((teamApiResult) => {

        this.teamApiResult = teamApiResult;

        // Assemble team1/2 abbreviations
        var teamAbbrs = ['', ''];
        var k;
        for (k = 0; k < teamApiResult.length; k++) {
          if (teamApiResult[k].teamName == this.gameApiResult.team1Name) {
            teamAbbrs[0] = teamApiResult[k].teamAbbr.toLowerCase();
          }
          if (teamApiResult[k].teamName == this.gameApiResult.team2Name) {
            teamAbbrs[1] = teamApiResult[k].teamAbbr.toLowerCase();
          }
        }

        // Assemble team1/2 colors/names
        var teamColors = [this.gameApiResult.team1Color, this.gameApiResult.team2Color];
        var teamNames = [this.gameApiResult.team1Name, this.gameApiResult.team2Name];

        // For each team, make a new <object> tag
        // that gets data from an svg file.
        var iconSize = "25";
        var i;
        for (i = 0; i < 2; i++) {
          var ip1 = i + 1;
          var containerId = "team" + ip1 + "-icon-container";
          var iconId = "team" + ip1 + "-icon";

          var container = document.getElementById(containerId);
          var svg = document.createElement("object");
          svg.setAttribute('type', 'image/svg+xml');
          svg.setAttribute('data', '../img/' + teamAbbrs[i].toLowerCase() + '.svg');
          svg.setAttribute('height', iconSize);
          svg.setAttribute('width', iconSize);
          svg.setAttribute('id', iconId);
          svg.classList.add('icon');
          svg.classList.add('team-icon');
          svg.classList.add('invisible');
          container.appendChild(svg);

          // Wait a little bit for the data to load,
          // then modify the color and make it visible
          var paint = function(color, elemId) {
            var mysvg = $('#' + elemId).getSVG();
            var child = mysvg.find("g path:first-child()");
            if (child.length > 0) {
              child.attr('fill', color);
              $('#' + elemId).removeClass('invisible');
            }
          }
          // This fails pretty often, so try a few times.
          setTimeout(paint, 100,  teamColors[i], iconId);
          setTimeout(paint, 250,  teamColors[i], iconId);
          setTimeout(paint, 500,  teamColors[i], iconId);
          setTimeout(paint, 1000, teamColors[i], iconId);
          setTimeout(paint, 1500, teamColors[i], iconId);
        }

      })
      .catch();
      // Note: intentionally do nothing.
      // If we can't figure out how to draw
      // the team icon, just leave it be.

    },

    getRowsFromUrlSafely : function() {
      // Get the number of rows from the URL parameters,
      // checking the specified value and setting to default
      // if invalid or not specified
      rows = parseInt(this.helpers.getUrlParameter('rows'));
      if (isNaN(rows) || rows < 0 || rows > 1000) {
        rows = this.defaultRows;
      }
      if (rows >= 200) {
        // Turn off the grid
        this.grid.current = 1;
      }
      return rows;
    },

    getColsFromUrlSafely : function() {
      // Get the number of cols from the URL parameters,
      // checking the specified value and setting to default
      // if invalid or not specified
      cols = parseInt(this.helpers.getUrlParameter('cols'));
      if (isNaN(cols) || cols < 0 || cols > 1000) {
        cols = this.defaultCols;
      }
      if (cols >= 200) {
        // Turn off the grid
        this.grid.current = 1;
      }
      return cols;
    },

    getCellSizeFromUrlSafely : function() {
      // Get the cell size from the URL parameters,
      // checking the specified value and setting to default
      // if invalid or not specified
      cellSize = parseInt(this.helpers.getUrlParameter('cellSize'));
      if (isNaN(cellSize) || cellSize < 1 || cellSize > 10) {
        cellSize = this.defaultCellSize;
      }
      if (cellSize <= 5) {
        // Turn off the grid
        this.grid.current = 1;
      }
      return cellSize;
    },

    /**
     * Set number of rows/columns and cell size.
     */
    setZoomState : function() {
      if (this.gameMode === true) {
        /* we are all good */
      } else {
        this.columns = this.getColsFromUrlSafely();
        this.rows = this.getRowsFromUrlSafely();
        this.cellSize = this.getCellSizeFromUrlSafely();
      }
    },

    /**
     * Parse the initial state variables s1/s2.
     * Initialize the internal state of the simulator.
     *
     * The internal state is stored as a list of live cells,
     * in the form of an array of arrays with this scheme:
     * [
     *   [ y1, x1, x2, x3, x4, x5 ],
     *   [ y2, x6, x7, x8, x9, x10 ],
     *   ...
     * ]
     */
    setInitialState : function() {

      this.listLife.initBuffers();

      // state 1 parameter
      state1 = jsonParse(decodeURI(this.initialState1));
      var irow, icol, y;
      for (irow = 0; irow < state1.length; irow++) {
        for (y in state1[irow]) {
          for (icol = 0 ; icol < state1[irow][y].length ; icol++) {
            var yy = parseInt(y);
            var xx = state1[irow][yy][icol];
            this.listLife.addCell(xx, yy, this.listLife.actualState);
            this.listLife.addCell(xx, yy, this.listLife.actualState1);
          }
        }
      }

      // state 2 parameter
      state2 = jsonParse(decodeURI(this.initialState2));
      var irow, icol, y;
      for (irow = 0; irow < state2.length; irow++) {
        for (y in state2[irow]) {
          for (icol = 0 ; icol < state2[irow][y].length ; icol++) {
            var yy = parseInt(y);
            var xx = state2[irow][yy][icol];
            this.listLife.addCell(xx, yy, this.listLife.actualState);
            this.listLife.addCell(xx, yy, this.listLife.actualState2);
          }
        }
      }
    },


    /**
     * Clean up actual state and prepare a new run
     */
    cleanUp : function() {
      this.listLife.init(); // Reset/init algorithm
      this.listLife.initBuffers();
      this.prepare();
    },


    relativeDiff : function(a, b, tol) {
      var aa = parseFloat(a);
      var bb = parseFloat(b);
      var smol = 1e-12;
      var denom = Math.max(Math.abs(aa + smol), Math.abs(bb + smol));
      return Math.abs(aa-bb)/denom;
    },

    approxEqual : function(a, b, tol) {
      var diff = this.relativeDiff(a, b, tol);
      return diff < tol;
    },


    /**
     * Check for a victor
     */
    checkForVictor : function(liveCounts) {
      if (this.zeroStart===true) {
        return;
      }
      if (this.foundVictor==false) {
        var maxDim = this.ruleParams.runningAvgMaxDim;

        var victoryPct = 0.0;
        var totalCells = liveCounts.liveCells1 + liveCounts.liveCells2;
        var smol = 1e-12; // To prevent division by zero
        if (totalCells > smol) {
            if (liveCounts.liveCells1 > liveCounts.liveCells2) {
                victoryPct = (liveCounts.liveCells1 / (totalCells + smol)) * 100;
            } else {
                victoryPct = (liveCounts.liveCells2 / (totalCells + smol)) * 100;
            }
        }

        if (this.generation < maxDim) {
          // Keep populating the window
          this.runningAvgWindow[this.generation] = victoryPct;

        } else {
          // Push and pop newest/oldest values
          var removed = this.runningAvgWindow.shift();
          this.runningAvgWindow.push(victoryPct);

          // compute running average
          var sum = 0.0;
          for (var i = 0; i < this.runningAvgWindow.length; i++) {
            sum += this.runningAvgWindow[i];
          }
          var runningAvg = sum/this.runningAvgWindow.length;

          // update running average last 3
          removed = this.runningAvgLast3.shift();
          this.runningAvgLast3.push(runningAvg);

          // Now run the following victory condition checks:
          // 1. Check if last running average was zero. If running average is zero, we can't have a victor yet.
          // 2. If running average is nonzero, check if running averages are all equal (victory by stability)
          //
          // Ignore case of running average of 0

          // Tolerance to check if running average values are zero (if so, can't stop)
          var tolZero = this.ruleParams.tolZero; //1e-8;

          // Tolerance to check if running averages are equal (stability)
          var tolStable = this.ruleParams.tolStable; //1e-6;

          if (!this.approxEqual(removed, 0.0, tolZero)) {
            // Here because we have a nonzero running average (game is going), and no victor.
            // Check if average has become stable
            var bool0eq1 = this.approxEqual(this.runningAvgLast3[0], this.runningAvgLast3[1], tolStable);
            var bool1eq2 = this.approxEqual(this.runningAvgLast3[1], this.runningAvgLast3[2], tolStable);
            var zeroCells = (liveCounts.liveCells1 === 0 || liveCounts.liveCells2 === 0);

            if ((bool0eq1 && bool1eq2) || zeroCells) {
                var z1 = this.approxEqual(this.runningAvgLast3[0], 50.0, tolStable);
                var z2 = this.approxEqual(this.runningAvgLast3[1], 50.0, tolStable);
                var z3 = this.approxEqual(this.runningAvgLast3[2], 50.0, tolStable);

                if ((!(z1 || z2 || z3)) || zeroCells) {
                    if (liveCounts.liveCells1 > liveCounts.liveCells2) {
                        this.foundVictor = true;
                        this.whoWon = 1;
                        this.showWinnersLosers = true;
                        this.handlers.buttons.run();
                        this.running = false;
                    } else if (liveCounts.liveCells2 > liveCounts.liveCells1) {
                        this.foundVictor = true;
                        this.whoWon = 2;
                        this.showWinnersLosers = true;
                        this.handlers.buttons.run();
                        this.running = false;
                    } else {
                        this.whoWon = 0;
                    }
                }
            }
          }
        } // end if gen > maxDim
      } // end if no victor found
    },

    /**
     * Update the statistics elements on the simulator page
     */
    updateStatisticsElements : function(liveCounts) {
      this.element.livecells.innerHTML  = liveCounts.liveCells;
      this.element.livecells1.innerHTML = liveCounts.liveCells1;
      this.element.livecells2.innerHTML = liveCounts.liveCells2;
      //this.element.livepct.innerHTML    = liveCounts.livePct.toFixed(1) + "%";
    },

    /**
     * Prepare DOM elements and Canvas for a new run
     */
    prepare : function() {
      this.generation = this.times.algorithm = this.times.gui = 0;
      this.mouseDown = this.clear.schedule = false;

      this.canvas.clearWorld(); // Reset GUI
      this.canvas.drawWorld(); // Draw State

      if (this.autoplay) { // Next Flow
        this.autoplay = false;
        this.handlers.buttons.run();
      }
    },

    updateTeamRecords : function() {
      if (this.gameMode === true) {
        var game = this.gameApiResult;
        if (game.isPostseason) {
          // Postseason: win-loss record in current series
          var t1_wlstr = game.team1SeriesWinLoss[0] + "-" + game.team1SeriesWinLoss[1];
          var t2_wlstr = game.team2SeriesWinLoss[0] + "-" + game.team2SeriesWinLoss[1];

          this.element.team1wlrec.innerHTML = t1_wlstr;
          this.element.team2wlrec.innerHTML = t2_wlstr;

        } else {
          // Season: win-loss record to date
          var t1_wlstr = game.team1WinLoss[0] + "-" + game.team1WinLoss[1];
          var t2_wlstr = game.team2WinLoss[0] + "-" + game.team2WinLoss[1];

          this.element.team1wlrec.innerHTML = t1_wlstr;
          this.element.team2wlrec.innerHTML = t2_wlstr;
        }
      } else {

        // TODO When not in game mode, do the following:
        // - remove table columns for records
        // - shrink icons column to 0px
        // - shrink scoreboard container to sm-4
        var elems;
        var i, j, k;

        // Delete unused columns from scoreboard table
        var idsToDelete = ['scoreboard-table-column-icon', 'scoreboard-table-column-spacing', 'scoreboard-table-column-record'];
        for(i = 0; i < idsToDelete.length; i++) {
          idToDelete = idsToDelete[i];
          elems = document.getElementsByClassName(idToDelete);
          while(elems[0]) {
            elems[0].parentNode.removeChild(elems[0]);
          }
        }

        // Shrink scoreboard container to sm-4
        var elem = document.getElementById('scoreboard-panels-container');
        elem.classList.remove('col-sm-8');
        elem.classList.add('col-sm-4');

      }
    },

    updateTeamNamesColors : function() {
      var i, e;

      // Team colors
      for (i = 0; i < this.element.team1color.length; i++) {
        e = this.element.team1color[i];
        e.style.color = this.colors.alive[0];
      }
      for (i = 0; i < this.element.team2color.length; i++) {
        e = this.element.team2color[i];
        e.style.color = this.colors.alive[1];
      }

      // Team names
      for (i = 0; i < this.element.team1name.length; i++) {
        e = this.element.team1name[i];
        e.innerHTML = this.teamNames[0];
      }
      for (i = 0; i < this.element.team2name.length; i++) {
        e = this.element.team2name[i];
        e.innerHTML = this.teamNames[1];
      }
    },

    getCounts : function() {
      var liveCounts = GOL.listLife.getLiveCounts();
      return liveCounts;
    },

    /**
     * keepDOMElements
     * Save DOM references for this session (one time execution)
     */
    keepDOMElements : function() {

      this.element.generation = document.getElementById('generation');
      this.element.livecells  = document.getElementById('livecells');
      this.element.livecells1 = document.getElementById('livecells1');
      this.element.livecells2 = document.getElementById('livecells2');

      this.element.team1wlrec = document.getElementById("team1record");
      this.element.team2wlrec = document.getElementById("team2record");
      this.element.team1wlrecCont = document.getElementById("team1record-container");
      this.element.team2wlrecCont = document.getElementById("team2record-container");

      // this.element.livepct    = document.getElementById('livePct');

      this.element.team1color = document.getElementsByClassName("team1color");
      this.element.team1name  = document.getElementsByClassName("team1name");

      this.element.team2color = document.getElementsByClassName("team2color");
      this.element.team2name  = document.getElementsByClassName("team2name");

      this.element.clearButton = document.getElementById('buttonClear');
      this.element.colorButton = document.getElementById('buttonColors');

      this.element.mapName = document.getElementById('mapname-label');
      this.element.mapPanel = document.getElementById('stats-panel-map');
      this.element.speedSlider = document.getElementById('speed-slider');

      this.element.team1winner = document.getElementById('team1winner');
      this.element.team2winner = document.getElementById('team2winner');
      this.element.team1loser = document.getElementById('team1loser');
      this.element.team2loser = document.getElementById('team2loser');
    },


    /**
     * registerEvents
     * Register event handlers for this session (one time execution)
     */
    registerEvents : function() {

      // Keyboard Events
      this.helpers.registerEvent(document.body, 'keyup', this.handlers.keyboard, false);
      // Controls
      this.helpers.registerEvent(document.getElementById('buttonRun'), 'click', this.handlers.buttons.run, false);
      this.helpers.registerEvent(document.getElementById('buttonStep'), 'click', this.handlers.buttons.step, false);
      if (this.sandboxMode === true || this.mapMode === true) {
        // Clear control only available in sandbox or map mode
        this.helpers.registerEvent(document.getElementById('buttonClear'), 'click', this.handlers.buttons.clear, false);
      }

      // Speed control slider
      this.helpers.registerEvent(document.getElementById('speed-slider'), 'input', this.handlers.buttons.speedControl, false);

      // Layout
      // on click, call function to show/hide trails
      this.helpers.registerEvent(document.getElementById('buttonTrail'), 'click', this.handlers.buttons.trail, false);
      // on click, call function to switch grid on/off
      this.helpers.registerEvent(document.getElementById('buttonGrid'), 'click', this.handlers.buttons.grid, false);
      // on click, call function to cycle all colors
      this.helpers.registerEvent(document.getElementById('buttonColors'), 'click', this.handlers.buttons.colorcycle, false);
    },

    /**
     * Run Next Step
     */
    nextStep : function() {

      // Hyper speed runs hyperGenerations generations per tick, other speeds run one
      var n = 0;
      do {
        GOL.runGeneration();
        n++;
      } while (GOL.running && GOL.helpers.isHyper() && n < GOL.hyperGenerations);

      var v = this.helpers.getWaitTimeMs();

      // Sleepy time before going on to next step
      setTimeout(() => {
        // Flow Control
        if (GOL.running) {
          GOL.nextStep();
        } else {
          if (GOL.clear.schedule) {
            GOL.cleanUp();
          }
        }
      }, v);

    },

    /**
     * Run one generation: algorithm, canvas, statistics, victory check
     */
    runGeneration : function() {

      var i, x, y, r;
      var liveCellNumbers, liveCellNumber, liveCellNumber1, liveCellNumber2;
      var algorithmTime, guiTime;

      // Algorithm run

      algorithmTime = (new Date());

      liveCounts = GOL.listLife.nextGeneration();

      algorithmTime = (new Date()) - algorithmTime;

      // Canvas run

      guiTime = (new Date());

      for (i = 0; i < GOL.listLife.redrawList.length; i++) {
        var x, y, action;
        x = GOL.listLife.redrawList[i][0];
        y = GOL.listLife.redrawList[i][1];
        action = GOL.listLife.redrawList[i][2];

        // Decide which action to take
        //
        if (action === 1) {
          GOL.canvas.changeCelltoAlive(x, y);
        } else if (action === 2) {
          GOL.canvas.keepCellAlive(x, y);
        } else {
          GOL.canvas.changeCelltoDead(x, y);
        }
      }

      guiTime = (new Date()) - guiTime;

      // Post-run updates

      // Clear Trail
      if (GOL.trail.schedule) {
        GOL.trail.schedule = false;
        GOL.canvas.drawWorld();
      }

      // Change Grid
      if (GOL.grid.schedule) {
        GOL.grid.schedule = false;
        GOL.canvas.drawWorld();
      }

      // Change Colors
      if (GOL.colors.schedule) {
        GOL.colors.schedule = false;
        GOL.canvas.drawWorld();
      }

      // Running Information
      GOL.generation++;
      GOL.element.generation.innerHTML = GOL.generation;

      // Update statistics
      GOL.updateStatisticsElements(liveCounts);

      // Check for victor
      GOL.checkForVictor(liveCounts);

      // Update winner/loser if found
      if (GOL.showWinnersLosers) {
        if (GOL.whoWon == 1) {
          GOL.element.team1winner.innerHTML = 'W';
          GOL.element.team2loser.innerHTML = 'L';
        } else {
          GOL.element.team2winner.innerHTML = 'W';
          GOL.element.team1loser.innerHTML = 'L';
        }
      }

      r = 1.0/GOL.generation;
      GOL.times.algorithm = (GOL.times.algorithm * (1 - r)) + (algorithmTime * r);
      GOL.times.gui = (GOL.times.gui * (1 - r)) + (guiTime * r);

    },


    /** ****************************************************************************************************************************
     * Event Handlers
     */
    handlers : {

      mouseDown : false,
      lastX : 0,
      lastY : 0,

      /**
       * When user clicks down, set mouse down state
       * and change change cell alive/dead state at
       * the current mouse location.
       * (sandbox mode only)
       */
      canvasMouseDown : function(event) {
        if (GOL.sandboxMode === true || GOL.mapMode === true) {
          var position = GOL.helpers.mousePosition(event);
          GOL.canvas.switchCell(position[0], position[1]);
          GOL.handlers.lastX = position[0];
          GOL.handlers.lastY = position[1];
          GOL.handlers.mouseDown = true;
        }
      },


      /**
       * Handle user mouse up instance.
       * (sandbox mode only)
       */
      canvasMouseUp : function() {
        if (GOL.sandboxMode === true || GOL.mapModed === true) {
          GOL.handlers.mouseDown = false;
        }
      },


      /**
       * If we have captured a mouse down event,
       * track where the mouse is going and change
       * cell alive/dead state at mouse location.
       * (sandbox mode only)
       */
      canvasMouseMove : function(event) {
        if (GOL.sandboxMode === true || GOL.mapMode === true) {
          if (GOL.handlers.mouseDown) {
            var position = GOL.helpers.mousePosition(event);
            if ((position[0] !== GOL.handlers.lastX) || (position[1] !== GOL.handlers.lastY)) {
              GOL.canvas.switchCell(position[0], position[1]);
              GOL.handlers.lastX = position[0];
              GOL.handlers.lastY = position[1];
            }
          }
        }
      },


      /**
       * Allow keyboard shortcuts
       */
      keyboard : function(e) {
        var event = e;
        if (!event) {
          event = window.event;
        }

        if (event.keyCode === 67) { // Key: C
          // User can only clear the board in sandbox mode
          if (GOL.sandboxMode === true || GOL.mapMode === true) {
            GOL.handlers.buttons.clear();
          }

        } else if (event.keyCode === 82 ) { // Key: R
          GOL.handlers.buttons.run();

        } else if (event.keyCode === 83 ) { // Key: S
          if (GOL.running) {
            // If running, S will stop the simulation
            GOL.handlers.buttons.run();
          } else {
            GOL.handlers.buttons.step();
          }

        } else if (event.keyCode === 70 ) { // Key: F
          var speed = GOL.element.speedSlider.value;
          speed = speed - 1;
          if (speed < 0) {
            speed = 4;
          }
          GOL.element.speedSlider.value = speed;
          GOL.handlers.buttons.speedControl();

        } else if (event.keyCode === 71 ) { // Key: G
          GOL.handlers.buttons.grid();

        }
      },


      buttons : {

        /**
         * Button Handler - Run
         */
        run : function() {

          GOL.running = !GOL.running;
          // Update run/stop button state
          if (GOL.running) {
            GOL.nextStep();
            document.getElementById('buttonRun').innerHTML = '<u>S</u>top';
            document.getElementById('buttonRun').classList.remove("btn-success");
            document.getElementById('buttonRun').classList.add("btn-danger");
          } else {
            document.getElementById('buttonRun').innerHTML = '<u>R</u>un';
            document.getElementById('buttonRun').classList.remove("btn-danger");
            document.getElementById('buttonRun').classList.add("btn-success");
          }
        },


        /**
         * Button Handler - Next Step - One Step only
         */
        step : function() {
          if (!GOL.running) {
            GOL.nextStep();
          }
        },


        /**
         * Button Handler - Clear World
         */
        clear : function() {
          if (GOL.sandboxMode === true || GOL.mapMode === true) {
            if (GOL.running) {
              GOL.clear.schedule = true;
              GOL.running = false;
              $("#buttonRun").text("Run");
              document.getElementById('buttonRun').classList.remove("btn-danger");
              document.getElementById('buttonRun').classList.add("btn-success");
            } else {
              GOL.cleanUp();

              //////////////////////////////////////////
              // DO IT (CLEAR BUTTON CLEANUP) HERE

              // If we found a victor and the user pressed clear, reset foundVictor
              GOL.foundVictor = false;
              GOL.whoWon = 0;
              GOL.showWinnersLosers = false;
              GOL.element.team1winner.innerHTML = '';
              GOL.element.team2winner.innerHTML = '';
              GOL.element.team1loser.innerHTML = '';
              GOL.element.team2loser.innerHTML = '';

              // GOL.listLife.actualState{1,2} should now be empty
              liveCounts = GOL.getCounts();
              // liveCounts should have 0 cells everywhere
              GOL.updateStatisticsElements(liveCounts);
              // This should probably be in an updateGeneration() function
              GOL.element.generation.innerHTML = 0;

              // DONE WITH CLEAR BUTTON CLEANUP
              //////////////////////////////////////////
            }
          }
        },


        /**
         * Button Handler - Remove/Add Trail
         *
         * This function is only called when the user clicks the "Trails" button.
         */
        trail : function() {
          GOL.trail.current = !GOL.trail.current;
          if (GOL.running) {
            GOL.trail.schedule = true;
          } else {
            GOL.canvas.drawWorld();
          }
        },

        /**
         * Cycle through the color schemes
         *
         * This function is only called when the user clicks the "Colors" button.
         */
        colorcycle : function() {
          if (GOL.colors.schemes.length > 1) {
            GOL.colors.currentScheme = (GOL.colors.currentScheme + 1) % GOL.colors.schemes.length;
            GOL.colors.alive = GOL.colors.schemes[GOL.colors.currentScheme].alive;
            if (GOL.gameMode === false) {
              GOL.teamNames = GOL.colors.schemes[GOL.colors.currentScheme].aliveLabels;
            }
            GOL.updateTeamNamesColors();
            if (GOL.running) {
              GOL.colors.schedule = true; // Delay redraw until end of next generation
            } else {
              GOL.canvas.drawWorld(); // Force complete redraw now
            }
          } else {
            console.log('Only one color scheme available');
          }
        },

        /**
         * Show/hide the grid
         *
         * This function is only called when the user clicks the "Grid" button.
         */
        grid : function() {
          GOL.grid.current = (GOL.grid.current + 1) % GOL.grid.schemes.length;
          if (GOL.running) {
            GOL.grid.schedule = true; // Delay redraw
          } else {
            GOL.canvas.drawWorld(); // Force complete redraw
          }
        },

        /**
         * Update simulation speed
         */
        speedControl : function() {
          // The getWaitTimeMs function will read
          // the value of the speed slider directly.
          // Here we only switch the slider and label into the Hyper style.
          var label = document.getElementById('speed-label-fast');
          var slider = GOL.element.speedSlider;
          if (GOL.helpers.isHyper()) {
            label.innerHTML = 'HYPER';
            label.classList.add('hyper');
            slider.classList.add('hyper');
          } else {
            label.innerHTML = '<u>F</u>aster';
            label.classList.remove('hyper');
            slider.classList.remove('hyper');
          }
        },

      },

    },


    /** ****************************************************************************************************************************
     *
     */
    canvas: {

      context : null,
      width : null,
      height : null,
      age : null,
      cellSize : null,
      cellSpace : null,


      /**
       * init
       */
      init : function() {

        this.canvas = document.getElementById('canvas');
        this.context = this.canvas.getContext('2d');

        this.cellSize = GOL.cellSize;
        this.cellSpace = 1;

        // register the mousedown/mouseup/mousemove events with function callbacks
        GOL.helpers.registerEvent(this.canvas, 'mousedown', GOL.handlers.canvasMouseDown, false);
        GOL.helpers.registerEvent(document, 'mouseup', GOL.handlers.canvasMouseUp, false);
        GOL.helpers.registerEvent(this.canvas, 'mousemove', GOL.handlers.canvasMouseMove, false);

        this.clearWorld();
      },


      /**
       * clearWorld
       */
      clearWorld : function () {
        var i, j;

        // Init ages (Canvas reference)
        this.age = [];
        for (i = 0; i < GOL.columns; i++) {
          this.age[i] = [];
          for (j = 0; j < GOL.rows; j++) {
            this.age[i][j] = 0; // Dead
          }
        }
      },


      /**
       * drawWorld
       * Normally the nextGeneration method redraws each cell as they change states.
       * This method is only called when team colors are changed, or the grid turned on/off.
       * In those cases the entire grid must be re-drawn from scratch.
       */
      drawWorld : function() {
        var i, j;

        // Special no grid case
        if (GOL.grid.schemes[GOL.grid.current].color === '') {
          this.setNoGridOn();
          this.width = this.height = 0;
        } else {
          this.setNoGridOff();
          this.width = this.height = 1;
        }

        // Dynamic canvas size
        this.width = this.width + (this.cellSpace * GOL.columns) + (this.cellSize * GOL.columns);
        this.canvas.setAttribute('width', this.width);

        this.height = this.height + (this.cellSpace * GOL.rows) + (this.cellSize * GOL.rows);
        this.canvas.setAttribute('height', this.height);

        // Fill background
        this.context.fillStyle = GOL.grid.schemes[GOL.grid.current].color;
        this.context.fillRect(0, 0, this.width, this.height);

        // Fill each cell
        for (i = 0 ; i < GOL.columns; i++) {
          for (j = 0 ; j < GOL.rows; j++) {
            if (GOL.listLife.isAlive(i, j)) {
              this.drawCell(i, j, true);
            } else {
              this.drawCell(i, j, false);
            }
          }
        }

      },


      /**
       * setNoGridOn
       */
      setNoGridOn : function() {
        this.cellSize = GOL.cellSize + 1;
        this.cellSpace = 0;
      },


      /**
       * setNoGridOff
       */
      setNoGridOff : function() {
        this.cellSize = GOL.cellSize;
        this.cellSpace = 1;
      },


      /**
       * drawCell
       */
      drawCell : function (i, j, alive) {

        if (alive) {

          // color by... color
          this.context.fillStyle = GOL.colors.alive[GOL.listLife.getCellColor(i, j) - 1];

        } else {
          if (GOL.trail.current && this.age[i][j] < 0) {
            this.context.fillStyle = GOL.colors.trail[(this.age[i][j] * -1) % GOL.colors.trail.length];
          } else {
            this.context.fillStyle = GOL.colors.dead;
          }
        }

        this.context.fillRect(this.cellSpace + (this.cellSpace * i) + (this.cellSize * i), this.cellSpace + (this.cellSpace * j) + (this.cellSize * j), this.cellSize, this.cellSize);

        // Draw light strokes cutting the canvas through the middle
        if (i===parseInt(GOL.columns/2)) {
          if (GOL.grid.mapOverlay==true) {
            this.context.fillStyle = mapZoneStrokeColor;
            this.context.fillRect(
              (this.cellSpace * i+1) + (this.cellSize * i+1) - 2*this.cellSpace,
              (this.cellSpace * j) + (this.cellSize * j) + this.cellSpace,
              this.cellSpace,
              this.cellSize,
            );
          }
        }

        if (j===parseInt(GOL.rows/2)) {
          if (GOL.grid.mapOverlay==true) {
            this.context.fillStyle = mapZoneStrokeColor;
            this.context.fillRect(
              (this.cellSpace * i+1) + (this.cellSize * i+1) - 2*this.cellSpace,
              (this.cellSpace * j) + (this.cellSize * j) + this.cellSpace,
              this.cellSize,
              this.cellSpace,
            );
          }
        }

      },


      /**
       * switchCell
       *
       * This is only activated when a user clicks on a cell
       */
      switchCell : function(i, j) {
        if (GOL.sandboxMode===true) {
          if (GOL.listLife.isAlive(i, j)) {
            if (GOL.listLife.getCellColor(i, j) == 1) {
              // Swap colors
              GOL.listLife.removeCell(i, j, GOL.listLife.actualState1);
              GOL.listLife.addCell(i, j, GOL.listLife.actualState2);
              this.keepCellAlive(i, j);
            } else {
              GOL.listLife.removeCell(i, j, GOL.listLife.actualState);
              GOL.listLife.removeCell(i, j, GOL.listLife.actualState2);
              this.changeCelltoDead(i, j);
            }
          } else {
            GOL.listLife.addCell(i, j, GOL.listLife.actualState);
            GOL.listLife.addCell(i, j, GOL.listLife.actualState1);
            this.changeCelltoAlive(i, j);
          }
        }
        if (GOL.running) {
          GOL.colors.schedule = true;
        } else {
          GOL.canvas.drawWorld();
        }
      },


      /**
       * keepCellAlive
       */
      keepCellAlive : function(i, j) {
        if (i >= 0 && i < GOL.columns && j >=0 && j < GOL.rows) {
          this.age[i][j]++;
          this.drawCell(i, j, true);
        }
      },


      /**
       * changeCelltoAlive
       */
      changeCelltoAlive : function(i, j) {
        if (i >= 0 && i < GOL.columns && j >=0 && j < GOL.rows) {
          this.age[i][j] = 1;
          this.drawCell(i, j, true);
        }
      },


      /**
       * changeCelltoDead
       */
      changeCelltoDead : function(i, j) {
        if (i >= 0 && i < GOL.columns && j >=0 && j < GOL.rows) {
          this.age[i][j] = -this.age[i][j]; // Keep trail
          this.drawCell(i, j, false);
        }
      }

    },


    /** ****************************************************************************************************************************
     *
     */
    listLife : {

      actualState : [],
      actualState1 : [],
      actualState2 : [],
      redrawList : [],


      /**
       * Initialize variables
       */
      init : function () {
        this.actualState = [];
        this.actualState1 = [];
        this.actualState2 = [];
        this._buffersReady = false;
      },


      /**
       * Allocate typed-array buffers for the optimized algorithm.
       * Must be called after GOL.columns/rows are set (i.e. in setInitialState/cleanUp).
       */
      initBuffers : function () {
        var rows = GOL.rows;
        var cols = GOL.columns;
        var size = rows * cols;

        // Double-buffered dense color grids (0=dead, 1=team1, 2=team2)
        this.colorA = new Uint8Array(size);
        this.colorB = new Uint8Array(size);
        this.color = this.colorA;
        this.useA = true;

        // Live cell index lists
        this.liveCells = new Int32Array(size);
        this.newLiveCells = new Int32Array(size);
        this.liveCount = 0;

        // Packed neighbor counts: low 16 bits = total, high 16 bits = team1
        this.packedNeighbors = new Uint32Array(size);

        // Generation stamps for birth-candidate dedup
        this.checkedStamp = new Uint32Array(size);
        this._currentStamp = 1;

        // Cell weights: how many times each live cell counts (dead cells hold 1).
        // Above 1 only for cells listed more than once in the initial conditions:
        // the old list-based engine (and gollyx-python) kept one entry per listing.
        this.weight = new Uint8Array(size).fill(1);

        // Split cells: listed for both teams in the initial conditions. They draw
        // as team 1 and count as team 1 neighbors for survival color, but their
        // team 2 listings count as team 2 for live counts and birth color.
        // They resolve to one team after the first generation.
        this.split2 = new Uint8Array(size);  // team 2 listings of each split cell
        this.splitCells = [];

        // Pre-computed toroidal wrapping
        this.rowUp = new Int32Array(rows);
        this.rowDown = new Int32Array(rows);
        this.colLeft = new Int32Array(cols);
        this.colRight = new Int32Array(cols);

        for (var y = 0; y < rows; y++) {
          this.rowUp[y] = y === 0 ? rows - 1 : y - 1;
          this.rowDown[y] = y === rows - 1 ? 0 : y + 1;
        }
        for (var x = 0; x < cols; x++) {
          this.colLeft[x] = x === 0 ? cols - 1 : x - 1;
          this.colRight[x] = x === cols - 1 ? 0 : x + 1;
        }

        // Reusable result object for getLiveCounts
        this._liveCountsResult = {liveCells: 0, liveCells1: 0, liveCells2: 0, livePct: 0};

        this._cols = cols;
        this._buffersReady = true;
      },


      getLiveCounts : function() {
        var color = this.color;
        var weight = this.weight;
        var liveCells = this.liveCells;
        var numLive = this.liveCount;

        var liveCells1 = 0;
        var liveCells2 = 0;
        for (var i = 0; i < numLive; i++) {
          var idx = liveCells[i];
          if (color[idx] === 1) liveCells1 += weight[idx];
          else liveCells2 += weight[idx];
        }
        // Split cells were counted as team 1 above; move their team 2 listings
        for (var s = 0; s < this.splitCells.length; s++) {
          var k = this.split2[this.splitCells[s]];
          liveCells1 -= k;
          liveCells2 += k;
        }
        var total = liveCells1 + liveCells2;
        var totalArea = GOL.columns * GOL.rows;
        var livePct = (total / totalArea) * 100.0;

        var r = this._liveCountsResult;
        r.liveCells = total;
        r.liveCells1 = liveCells1;
        r.liveCells2 = liveCells2;
        r.livePct = livePct;
        return r;
      },


      /**
       * Optimized three-phase nextGeneration using packed neighbor counts.
       * Hardcodes B3/S23 rules (standard Game of Life).
       */
      nextGeneration : function() {
        var cols = this._cols;
        var color = this.color;
        var liveCells = this.liveCells;
        var numLive = this.liveCount;
        var rowUp = this.rowUp;
        var rowDown = this.rowDown;
        var colLeft = this.colLeft;
        var colRight = this.colRight;
        var packed = this.packedNeighbors;
        var checkedStamp = this.checkedStamp;
        var stamp = this._currentStamp;
        var weight = this.weight;
        var splitCells = this.splitCells;
        this.redrawList = [];

        // Phase 1: Accumulate packed neighbor counts
        // Low 16 bits = total count, high 16 bits = team1 count
        for (var li = 0; li < numLive; li++) {
          var idx = liveCells[li];
          var y = (idx / cols) | 0;
          var x = idx - y * cols;
          var ym1Off = rowUp[y] * cols;
          var yOff = y * cols;
          var yp1Off = rowDown[y] * cols;
          var xm1 = colLeft[x];
          var xp1 = colRight[x];

          var inc = (color[idx] === 1 ? 0x10001 : 1) * weight[idx];

          packed[ym1Off + xm1] += inc;
          packed[ym1Off + x]   += inc;
          packed[ym1Off + xp1] += inc;
          packed[yOff  + xm1]  += inc;
          packed[yOff  + xp1]  += inc;
          packed[yp1Off + xm1] += inc;
          packed[yp1Off + x]   += inc;
          packed[yp1Off + xp1] += inc;
        }

        // Split cells: take their team 2 listings back out of the team 1 count
        // of dead neighbors (birth color). Live neighbors keep the survival count.
        for (var si = 0; si < splitCells.length; si++) {
          var sIdx = splitCells[si];
          var k2 = this.split2[sIdx] * 0x10000;
          var sy = (sIdx / cols) | 0;
          var sx = sIdx - sy * cols;
          var sNeighbors = [
            rowUp[sy] * cols + colLeft[sx], rowUp[sy] * cols + sx, rowUp[sy] * cols + colRight[sx],
            sy * cols + colLeft[sx], sy * cols + colRight[sx],
            rowDown[sy] * cols + colLeft[sx], rowDown[sy] * cols + sx, rowDown[sy] * cols + colRight[sx]
          ];
          for (var m = 0; m < 8; m++) {
            if (color[sNeighbors[m]] === 0) {
              packed[sNeighbors[m]] -= k2;
            }
          }
        }

        // Phase 2: Determine new state + build redrawList
        var newColor = this.useA ? this.colorB : this.colorA;
        var newLiveCells = this.newLiveCells;
        var newCount = 0;
        var redrawList = this.redrawList;

        for (var li = 0; li < numLive; li++) {
          var idx = liveCells[li];
          var p = packed[idx];
          var n = p & 0xFFFF;
          var y = (idx / cols) | 0;
          var x = idx - y * cols;

          // Survive: B3/S23 — cell survives if 2 or 3 neighbors
          if (n === 2 || n === 3) {
            var n1 = p >>> 16;
            var n2 = n - n1;
            if (n1 > n2) {
              newColor[idx] = 1;
            } else if (n2 > n1) {
              newColor[idx] = 2;
            } else {
              newColor[idx] = (x % 2 === y % 2) ? 1 : 2;
            }
            newLiveCells[newCount++] = idx;
            redrawList.push([x, y, 2]); // Keep alive
          } else {
            weight[idx] = 1; // Dead cells hold weight 1, so births start at 1
            redrawList.push([x, y, 0]); // Kill cell
          }

          // Birth: check all 8 neighbors of this live cell for dead candidates
          var ym1Off = rowUp[y] * cols;
          var yOff = y * cols;
          var yp1Off = rowDown[y] * cols;
          var xm1 = colLeft[x];
          var xp1 = colRight[x];

          var nIdx, np, nn, nn1, ny, nx;

          nIdx = ym1Off + xm1;
          if (color[nIdx] === 0 && checkedStamp[nIdx] !== stamp) {
            checkedStamp[nIdx] = stamp;
            np = packed[nIdx]; nn = np & 0xFFFF;
            if (nn === 3) {
              nn1 = np >>> 16;
              if (nn1 > 1) { newColor[nIdx] = 1; }
              else if (nn1 < 2) { newColor[nIdx] = 2; }
              else { ny = (nIdx / cols) | 0; newColor[nIdx] = ((nIdx - ny * cols) % 2 === ny % 2) ? 1 : 2; }
              newLiveCells[newCount++] = nIdx;
              ny = rowUp[y]; nx = colLeft[x];
              redrawList.push([nx, ny, 1]);
            }
          }

          nIdx = ym1Off + x;
          if (color[nIdx] === 0 && checkedStamp[nIdx] !== stamp) {
            checkedStamp[nIdx] = stamp;
            np = packed[nIdx]; nn = np & 0xFFFF;
            if (nn === 3) {
              nn1 = np >>> 16;
              if (nn1 > 1) { newColor[nIdx] = 1; }
              else if (nn1 < 2) { newColor[nIdx] = 2; }
              else { ny = (nIdx / cols) | 0; newColor[nIdx] = ((nIdx - ny * cols) % 2 === ny % 2) ? 1 : 2; }
              newLiveCells[newCount++] = nIdx;
              ny = rowUp[y];
              redrawList.push([x, ny, 1]);
            }
          }

          nIdx = ym1Off + xp1;
          if (color[nIdx] === 0 && checkedStamp[nIdx] !== stamp) {
            checkedStamp[nIdx] = stamp;
            np = packed[nIdx]; nn = np & 0xFFFF;
            if (nn === 3) {
              nn1 = np >>> 16;
              if (nn1 > 1) { newColor[nIdx] = 1; }
              else if (nn1 < 2) { newColor[nIdx] = 2; }
              else { ny = (nIdx / cols) | 0; newColor[nIdx] = ((nIdx - ny * cols) % 2 === ny % 2) ? 1 : 2; }
              newLiveCells[newCount++] = nIdx;
              ny = rowUp[y]; nx = colRight[x];
              redrawList.push([nx, ny, 1]);
            }
          }

          nIdx = yOff + xm1;
          if (color[nIdx] === 0 && checkedStamp[nIdx] !== stamp) {
            checkedStamp[nIdx] = stamp;
            np = packed[nIdx]; nn = np & 0xFFFF;
            if (nn === 3) {
              nn1 = np >>> 16;
              if (nn1 > 1) { newColor[nIdx] = 1; }
              else if (nn1 < 2) { newColor[nIdx] = 2; }
              else { ny = (nIdx / cols) | 0; newColor[nIdx] = ((nIdx - ny * cols) % 2 === ny % 2) ? 1 : 2; }
              newLiveCells[newCount++] = nIdx;
              nx = colLeft[x];
              redrawList.push([nx, y, 1]);
            }
          }

          nIdx = yOff + xp1;
          if (color[nIdx] === 0 && checkedStamp[nIdx] !== stamp) {
            checkedStamp[nIdx] = stamp;
            np = packed[nIdx]; nn = np & 0xFFFF;
            if (nn === 3) {
              nn1 = np >>> 16;
              if (nn1 > 1) { newColor[nIdx] = 1; }
              else if (nn1 < 2) { newColor[nIdx] = 2; }
              else { ny = (nIdx / cols) | 0; newColor[nIdx] = ((nIdx - ny * cols) % 2 === ny % 2) ? 1 : 2; }
              newLiveCells[newCount++] = nIdx;
              nx = colRight[x];
              redrawList.push([nx, y, 1]);
            }
          }

          nIdx = yp1Off + xm1;
          if (color[nIdx] === 0 && checkedStamp[nIdx] !== stamp) {
            checkedStamp[nIdx] = stamp;
            np = packed[nIdx]; nn = np & 0xFFFF;
            if (nn === 3) {
              nn1 = np >>> 16;
              if (nn1 > 1) { newColor[nIdx] = 1; }
              else if (nn1 < 2) { newColor[nIdx] = 2; }
              else { ny = (nIdx / cols) | 0; newColor[nIdx] = ((nIdx - ny * cols) % 2 === ny % 2) ? 1 : 2; }
              newLiveCells[newCount++] = nIdx;
              ny = rowDown[y]; nx = colLeft[x];
              redrawList.push([nx, ny, 1]);
            }
          }

          nIdx = yp1Off + x;
          if (color[nIdx] === 0 && checkedStamp[nIdx] !== stamp) {
            checkedStamp[nIdx] = stamp;
            np = packed[nIdx]; nn = np & 0xFFFF;
            if (nn === 3) {
              nn1 = np >>> 16;
              if (nn1 > 1) { newColor[nIdx] = 1; }
              else if (nn1 < 2) { newColor[nIdx] = 2; }
              else { ny = (nIdx / cols) | 0; newColor[nIdx] = ((nIdx - ny * cols) % 2 === ny % 2) ? 1 : 2; }
              newLiveCells[newCount++] = nIdx;
              ny = rowDown[y];
              redrawList.push([x, ny, 1]);
            }
          }

          nIdx = yp1Off + xp1;
          if (color[nIdx] === 0 && checkedStamp[nIdx] !== stamp) {
            checkedStamp[nIdx] = stamp;
            np = packed[nIdx]; nn = np & 0xFFFF;
            if (nn === 3) {
              nn1 = np >>> 16;
              if (nn1 > 1) { newColor[nIdx] = 1; }
              else if (nn1 < 2) { newColor[nIdx] = 2; }
              else { ny = (nIdx / cols) | 0; newColor[nIdx] = ((nIdx - ny * cols) % 2 === ny % 2) ? 1 : 2; }
              newLiveCells[newCount++] = nIdx;
              ny = rowDown[y]; nx = colRight[x];
              redrawList.push([nx, ny, 1]);
            }
          }
        }

        // Phase 3: Cleanup and swap
        packed.fill(0);
        for (var li = 0; li < numLive; li++) {
          color[liveCells[li]] = 0;
        }
        this._currentStamp = stamp + 1;

        // Split cells have resolved to one team
        for (var si = 0; si < splitCells.length; si++) {
          this.split2[splitCells[si]] = 0;
        }
        this.splitCells = [];

        // Swap color buffer pointers and live cell list pointers
        this.color = newColor;
        this.useA = !this.useA;
        this.liveCells = newLiveCells;
        this.newLiveCells = liveCells;
        this.liveCount = newCount;

        return this.getLiveCounts();
      },


      /**
       * Given an x coordinate, normalize for a periodic grid
       * (add total number of rows, then take result mod number of rows).
       * Ensures coordinate is not negative/off grid.
       */
      periodicNormalizex(j) {
        return (j + GOL.columns)%(GOL.columns);
      },


      /**
       * Given a y coordinate, normalize for a periodic grid
       * (add total number of rows, then take result mod number of rows).
       * Ensures coordinate is not negative/off grid.
       */
      periodicNormalizey(j) {
        return (j + GOL.rows)%(GOL.rows);
      },




      /**
       * Check if the cell at location (x, y) is alive
       */
      isAlive : function(x, y) {
        x = this.periodicNormalizex(x);
        y = this.periodicNormalizey(y);
        return this.color[y * this._cols + x] !== 0;
      },

      /**
       * Get the color of the cell at location (x, y)
       * (assumes cell is alive, returns 0 if cell was not found)
       */
      getCellColor : function(x, y) {
        x = this.periodicNormalizex(x);
        y = this.periodicNormalizey(y);
        return this.color[y * this._cols + x];
      },

      /**
       *
       */
      removeCell : function(x, y, state) {
        x = this.periodicNormalizex(x);
        y = this.periodicNormalizey(y);
        var idx = y * this._cols + x;

        if (state === this.actualState) {
          // Remove from live cell list and clear color (whole cell, any weight)
          if (this.color[idx] !== 0) {
            this.color[idx] = 0;
            this.weight[idx] = 1;
            this.split2[idx] = 0;
            // Remove from liveCells by scanning for idx
            for (var i = 0; i < this.liveCount; i++) {
              if (this.liveCells[i] === idx) {
                this.liveCells[i] = this.liveCells[this.liveCount - 1];
                this.liveCount--;
                break;
              }
            }
          }
        } else if (state === this.actualState1) {
          if (this.color[idx] === 1) {
            this.color[idx] = 0;
            this.split2[idx] = 0;
          }
        } else if (state === this.actualState2) {
          if (this.color[idx] === 2) {
            this.color[idx] = 0;
          }
        }
      },


      /**
       *
       */
      addCell : function(x, y, state) {
        x = this.periodicNormalizex(x);
        y = this.periodicNormalizey(y);
        var idx = y * this._cols + x;

        if (state === this.actualState) {
          if (this.color[idx] === 0) {
            // Add to live cell list if not already alive
            this.liveCells[this.liveCount++] = idx;
            this.weight[idx] = 1;
          } else {
            // Listed again in the initial conditions: count it again
            this.weight[idx]++;
          }
        } else if (state === this.actualState1) {
          this.color[idx] = 1;
        } else if (state === this.actualState2) {
          if (this.color[idx] === 1) {
            // Listed for both teams: stays team 1, track the team 2 listing
            if (this.split2[idx] === 0) {
              this.splitCells.push(idx);
            }
            this.split2[idx]++;
          } else {
            this.color[idx] = 2;
          }
        }
      }

    },


    /** ****************************************************************************************************************************
     *
     */
    helpers : {
      urlParameters : null, // Cache


      /**
       * Return a random integer from [min, max]
       */
      random : function(min, max) {
        return min <= max ? min + Math.round(Math.random() * (max - min)) : null;
      },


      /**
       * Get URL Parameters
       */
      getUrlParameter : function(name) {
        if (this.urlParameters === null) { // Cache miss
          var hash, hashes, i;

          this.urlParameters = [];
          hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

          for (i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            this.urlParameters.push(hash[0]);
            this.urlParameters[hash[0]] = hash[1];
          }
        }

        return this.urlParameters[name];
      },


      /**
       * Register Event
       */
      registerEvent : function (element, event, handler, capture) {
        if (/msie/i.test(navigator.userAgent)) {
          element.attachEvent('on' + event, handler);
        } else {
          element.addEventListener(event, handler, capture);
        }
      },


      /**
       *
       */
      mousePosition : function (e) {
        // http://www.malleus.de/FAQ/getImgMousePos.html
        // http://www.quirksmode.org/js/events_properties.html#position
        var event, x, y, domObject, posx = 0, posy = 0, top = 0, left = 0, cellSize = GOL.cellSize + 1;

        event = e;
        if (!event) {
          event = window.event;
        }

        if (event.pageX || event.pageY)     {
          posx = event.pageX;
          posy = event.pageY;
        } else if (event.clientX || event.clientY)  {
          posx = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
          posy = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        domObject = event.target || event.srcElement;

        while ( domObject.offsetParent ) {
          left += domObject.offsetLeft;
          top += domObject.offsetTop;
          domObject = domObject.offsetParent;
        }

        domObject.pageTop = top;
        domObject.pageLeft = left;

        x = Math.ceil(((posx - domObject.pageLeft)/cellSize) - 1);
        y = Math.ceil(((posy - domObject.pageTop)/cellSize) - 1);

        return [x, y];
      },

      /**
       * Hyper speed is the leftmost slider position (0)
       */
      isHyper : function () {
        try {
          return GOL.element.speedSlider.value == 0;
        } catch {
          return false;
        }
      },

      getWaitTimeMs : function () {
        var j = 0;
        var default_ = 600;
        try {
          j = GOL.element.speedSlider.value;
        } catch {
          // console.log("Could not read speed-slider value, using default value of 60 ms");
          return default_;
        }
        if (j<=0) {
          return 0;
        } else if (j==1) {
          return 8;
        } else if (j==2) {
          return 24;
        } else if (j==3) {
          return 60;
        } else if (j==4) {
          return 250;
        } else if (j==5) {
          return default_;
        } else {
          return default_;
        }
      }
    }

  };


  /**
   * Init on 'load' event
   */
  GOL.helpers.registerEvent(window, 'load', function () {
    GOL.init();
  }, false);

}());
