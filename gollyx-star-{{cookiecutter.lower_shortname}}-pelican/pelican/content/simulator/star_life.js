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

  var realBackgroundColor = "#060606";
  var gridStrokeColor1    = "#3a3a3a";
  var mapZoneStrokeColor  = "#dddddd";
  var grays = ["#303030", "#3f3f3f", "#494949", "#525252", "#5d5d5d"];

  var GOL = {

    // http://www.mirekw.com/ca/rullex_gene.html

    // Star Wars CA
    ruleParams : {
      b : [2],
      s : [3, 4, 5],
      c : 4,
      tolZero : 1e-8,
      tolStable : 1e-6,
      runningAvgMaxDim: 280,
    },

    // // Banners
    // ruleParams : {
    //   b : [3, 4, 5, 7],
    //   s : [2, 3, 6, 7],
    //   c : 5,
    //   tolZero : 1e-8,
    //   tolStable : 1e-5,
    //   //runningAvgMaxDim: 280,
    //   runningAvgMaxDim: 220,
    // },

    // // Caterpillars
    // ruleParams : {
    //   s : [1, 2, 4, 5, 6, 7],
    //   b : [3, 7, 8],
    //   c : 4,
    //   tolZero : 1e-8,
    //   tolStable : 1e-6,
    //   runningAvgMaxDim: 280,
    // },

    // // Transer
    // ruleParams : {
    //   s : [1, 3, 4, 5, 8],
    //   b : [3, 8],
    //   c : 6,
    //   tolZero : 1e-8,
    //   tolStable : 1e-6,
    //   runningAvgMaxDim: 280,
    // },

    // Initial Conditions:
    s1Default: '[{"49":[93,94,95,97,98,100,101,144,145,146,147,148,149,151]},{"50":[94,95,96,97,98,99,100,101,143,144,147,149,150,151]},{"51":[93,96,97,98,99,100,101,144,145,146,147,148,150,151]},{"52":[93,94,95,96,97,98,99,100,101,143,144,145,146,148,149,150,151]},{"53":[93,95,96,97,98,99,100,101,143,144,145,148,149,150,151]},{"54":[93,94,96,97,98,100,101,143,145,146,147,149,150,151]},{"55":[93,94,95,96,98,99,100,101,143,144,145,146,148,151]},{"56":[93,94,95,96,97,98,100,101,144,146,147,148,149]},{"57":[93,94,95,96,97,99,100,144,145,146,148,149,150]},{"58":[93,94,96,97,99,100,101,144,145,147,150]},{"59":[93,94,96,97,98,99,100,101,143,144,145,149,150,151]},{"60":[93,94,95,96,98,99,100,143,144,145,146,147,149,151]},{"61":[93,94,95,96,97,99,100,101,143,144,146,147,148,149,150,151]},{"62":[93,94,95,96,97,98,99,100,144,145,146,148,149,150,151]},{"63":[93,94,96,97,98,99,101,147,149,150,151]},{"64":[93,94,96,97,98,99,100,143,144,145,146,147,149,150,151]},{"65":[93,97,98,99,100,101,143,144,145,146,147,148,149,150,151]},{"66":[93,94,95,97,98,99,100,144,147,148,150,151]},{"67":[93,95,97,99,100,101,145,146,149,150,151]},{"68":[94,95,96,97,98,99,100,101,143,144,145,146,147,148,149]},{"69":[93,95,96,97,101,143,144,148,149,150,151]},{"70":[94,95,96,97,98,99,100,143,144,146,147,148,149,150,151]},{"71":[93,94,95,96,97,98,99,101,143,144,145,146,147,148,149,150]},{"72":[93,94,96,97,98,99,100,101,143,144,149,150,151]},{"73":[93,94,95,96,97,98,101,143,145,147,148,149,150]},{"74":[93,94,96,97,99,100,101,143,144,145,146,147,148,149,150,151]},{"75":[93,94,95,96,97,99,100,101,143,145,146,147,148,150,151]},{"76":[93,94,95,97,98,100,143,145,146,147,148,149,151]},{"77":[93,94,95,96,97,98,99,100,101,143,144,145,146,147,151]},{"78":[93,94,96,97,98,99,100,101,144,145,146,149,150,151]},{"79":[93,95,96,97,98,99,100,143,146,149,151]},{"80":[93,94,95,97,98,99,100,101,143,144,145,146,147,148,149,150,151]},{"81":[93,94,95,96,97,98,99,100,101,143,144,146,147,148,149,150,151]},{"82":[93,94,95,96,98,99,100,101,143,144,145,146,147,148,149,150,151]},{"83":[93,95,97,98,99,100,101,143,144,145,146,147,148,149,150,151]},{"84":[93,94,95,96,97,99,100,101,144,145,146,147,148,149,151]},{"85":[94,96,97,98,99,144,145,146,147,148,149,150,151]},{"86":[93,94,95,96,97,98,99,100,101,143,145,146,147,148,149,150,151]},{"87":[94,95,96,97,98,100,101,143,144,146,147,149,151]},{"88":[93,94,95,96,97,98,99,100,143,144,145,146,147,148,149,150,151]},{"89":[93,94,96,97,98,99,100,101,144,145,147,148,149,150,151]},{"90":[98,100,143,144,145,146,147,148,149,151]},{"91":[93,94,96,97,98,99,100,101,143,144,146,147,148,149,150,151]},{"92":[93,94,95,96,97,98,99,100,101,143,144,145,147,148,149,150,151]},{"93":[93,94,95,96,97,99,100,143,144,145,146,147,148,149,150]},{"94":[93,95,96,97,98,99,100,143,145,146,147,148,149,150]},{"95":[93,94,95,96,97,98,99,100,101,143,145,146,147,148,149,150,151]},{"96":[93,94,95,96,97,98,99,100,101,143,144,145,146,147,148,149,150,151]},{"97":[94,95,96,97,98,99,100,101,144,146,147,148,149]}]',
    s2Default: '[{"47":[52,53,54,55,56,57,58,59,188,189,190,191,192,194,195,196]},{"48":[54,55,56,57,58,60,188,189,190,192,193,195,196]},{"49":[52,53,55,56,57,58,59,188,189,190,191,193,194,195,196]},{"50":[52,53,54,56,58,59,60,189,190,191,192,193,194,196]},{"51":[52,53,54,55,56,57,58,188,189,190,191,192,193,195,196]},{"52":[54,56,57,58,59,60,188,189,190,192,193,194]},{"53":[53,54,55,56,57,58,59,188,189,190,191,192,194,195]},{"54":[52,53,54,57,58,60,188,189,190,192,193,194,195,196]},{"55":[52,53,54,55,56,57,59,60,190,193,194,195,196]},{"56":[52,53,54,55,56,57,58,60,188,189,190,191,192,193,194]},{"57":[52,53,55,56,57,59,60,189,190,192,193,195]},{"58":[52,53,55,57,60,188,189,192,193,194,195,196]},{"59":[52,53,55,56,57,58,60,188,189,190,191,193,194,195,196]},{"60":[53,54,55,56,57,58,59,60,188,189,190,192,193,194,196]},{"61":[53,54,55,56,57,58,60,188,189,190,192,193,194,195,196]},{"62":[52,53,54,55,56,57,58,59,60,188,190,192,196]},{"63":[52,53,56,58,59,188,189,190,191,192,193,194,195,196]},{"64":[53,54,55,57,59,60,189,190,191,192,194,195]},{"65":[53,56,57,59,60,188,189,190,191,192,195,196]},{"66":[52,53,54,56,57,58,59,188,189,190,192,194,195]},{"67":[52,53,54,56,57,58,59,189,191,193,194,195,196]},{"68":[52,53,55,56,57,58,59,60,189,190,191,192,193,194,195,196]},{"69":[52,53,54,55,56,57,58,59,60,188,189,190,192,193,194,195,196]},{"70":[52,53,54,56,57,58,59,60,188,189,190,191,192,193,194,195,196]},{"71":[52,55,57,58,59,60,190,191,192,193,195,196]},{"72":[52,53,54,55,56,57,58,59,60,189,190,191,192,193,194,195]},{"73":[52,54,55,56,58,59,60,189,190,191,192,193,194,195,196]},{"74":[52,53,54,55,56,57,58,59,188,190,191,192,193,194,195,196]},{"75":[52,53,54,55,56,188,190,191,192,193,194,195,196]},{"76":[52,53,55,56,57,58,59,60,188,190,191,192,193,194,196]},{"77":[52,53,55,56,57,58,59,60,188,189,190,191,192,193,194,195,196]},{"78":[52,53,54,55,56,57,58,59,60,188,190,191,192,194,195]},{"79":[53,55,56,57,58,59,60,189,190,191,192,193,194,195,196]},{"80":[52,54,55,56,57,58,59,60,189,190,193,194,195]},{"81":[52,53,54,55,56,58,59,60,188,189,190,191,193,194,195]},{"82":[52,53,54,55,57,58,59,60,188,189,190,191,192,193,195,196]},{"83":[52,53,54,56,58,59,60,188,189,190,191,193,195,196]},{"84":[52,53,54,55,56,57,58,59,60,189,190,191,193,194,195]},{"85":[52,53,54,55,56,57,59,60,188,189,190,191,192,193,194,195,196]},{"86":[52,55,56,57,58,60,188,189,190,191,192,193,194,195]},{"87":[52,53,55,57,58,59,60,188,189,190,191,192,194,195]},{"88":[52,54,55,56,57,58,60,189,192,193,194,196]},{"89":[53,54,55,57,58,59,60,188,189,190,191,192,193,194,196]},{"90":[52,53,54,55,56,57,58,59,60,188,189,191,192,194,195,196]},{"91":[52,53,54,55,57,58,59,60,188,189,190,192,193,194,195]},{"92":[52,53,54,55,56,58,59,60,188,189,190,191,192,193,195]},{"93":[52,53,55,56,57,58,59,188,190,191,193,194,195,196]},{"94":[52,53,54,55,56,57,59,60,189,191,192,193,194,195,196]},{"95":[52,53,54,55,56,57,58,60,188,189,190,191,192,193,195]}]',

    // two acorns
    //s1Default: '[{"50":[60,160]},{"51":[62,162]},{"52":[59,60,63,64,65,159,160,163,164,165]}]',
    //s2Default: '[{"60":[60,160]},{"61":[62,162]},{"62":[59,60,63,64,65,159,160,163,164,165]}]',

    // Geometry:
    defaultCols: 240,
    defaultRows: 160,
    defaultCellSize: 3,

    //// Stability:
    //// Previously this was 240, but that was a bit too small for Star Wars CA
    //// If increased to 300, it never converges if oscillators are present
    //// This should be rule-specific
    //runningAvgMaxDim: 280,

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

    columns : 0,
    rows : 0,
    cellSize: 0,

    waitTimeMs: 0,
    generation : 0,

    running : false,
    autoplay : false,

    // Cell colors
    //
    // dead/trail colors always the same
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
      deadWait: null,


      // https://www.colorhexa.com/ffc20a-to-272b30
      schemes : [
        {
          aliveLabels: ['Orange', 'Blue', 'Referees'],
          alive:       ['#e66100', '#0c7bdc', '#ffffff'],
        },
        {
          aliveLabels: ['Yellow', 'Red', 'Referees'],
          alive: ['#ffc20a', '#dc3220', '#ffffff'],
        }
      ],

      getRefereeLabel : function() {
        return "Referees";
      },
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
      liveCellsColors: [],
      livepct: null,
      teamColors: [],
      teamNames: [],
      teamRanks: [],
      mapName: null,
      mapPanel: null,
    },

    // Initial state
    // Set in loadConfig()
    initialState1 : null,
    initialState2 : null,
    initialState3 : null,

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
      // Remove ability to specify referee state by URL
      // this.s3user = this.helpers.getUrlParameter('s3');

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
            gameTitleElem.innerHTML = "Star {{cookiecutter.upper_shortname}}: " + gameApiResult.description + " <small>- S" + sp1 + "</small>";
          } else {
            var sp1 = gameApiResult.season + 1;
            var dp1 = gameApiResult.day + 1;
            var descr = "Star {{cookiecutter.upper_shortname}} Cup: Season " + sp1 + " Day " + dp1;
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

        // Load a random map from the /map API endpoint
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
          gameTitleElem.innerHTML = "Star {{cookiecutter.upper_shortname}} Map: " + mapApiResult.mapName;

          this.setTeamNames();
          this.setColors();

          // Initial conditions
          this.initialState1 = mapApiResult.initialConditions1;
          this.initialState2 = mapApiResult.initialConditions2;
          this.initialState3 = mapApiResult.initialConditions3;

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
        // No ability to specify referee state by URL, and no default state
        this.initialState3 = [{}];

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

      // If all cell counts are 0 to begin with, disable victory check
      this.zeroStart = false;
      var zeroScores = 0;

      ////////////////////////////////
      // hard-coded rules format
      var r;
      for (r=0; r<this.colors.ncolors-1; r++) {
        if (liveCounts.liveCellsColors[r]==0) {
          zeroScores++;
        }
      }
      // end hard-coded rules format
      ////////////////////////////////

      var shutoutConditions = (zeroScores == 1);
      if (shutoutConditions) {
        this.zeroStart = true;
      }

    },

    /**
     * Update the Game of Life scoreboard with winner/loser
     * indicators, if this is a game and we know the score.
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
        this.teamNames = [this.gameApiResult.team1Name, this.gameApiResult.team2Name, this.colors.getRefereeLabel()];
      } else {
        // Use color labels
        this.teamNames = this.colors.schemes[this.colors.currentScheme].aliveLabels;
      }
    },

    /**
     * Given the team color and the grid background color,
     * calculate the background color of dead waiting cells.
     */
    interpolateDeadWaitColor : function(hexcol1, hexcol2, dw) {
      slots = (this.ruleParams.c-1);
      p = (slots-dw)/slots;

      col1 = hexcol1.slice(1,hexcol1.length);
      col2 = hexcol2.slice(1,hexcol2.length);

      const rgb1 = parseInt(col1, 16);
      const rgb2 = parseInt(col2, 16);
      
      const [r1, g1, b1] = this.toArray(rgb1);
      const [r2, g2, b2] = this.toArray(rgb2);
      
      const q = 1-p;
      const rr = Math.round(r1 * p + r2 * q);
      const rg = Math.round(g1 * p + g2 * q);
      const rb = Math.round(b1 * p + b2 * q);
      
      var result = Number((rr << 16) + (rg << 8) + rb).toString(16);
      if (result.length < 6) {
        var i;
        for (i=0; i<(6 - result.length); i++) {
          result = "0" + result;
        }
      }
      return result;
    },

    toArray : function(rgb) {
      const r = rgb >> 16;
      const g = (rgb >> 8) % 256;
      const b = rgb % 256;
    
      return [r, g, b];
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
          // Hard-coded referee color
          aliveLabels : [this.gameApiResult.team1Name, this.gameApiResult.team2Name, 'Referees'],
          alive : [this.gameApiResult.team1Color, this.gameApiResult.team2Color, '#ffffff'],
          deadWait : [
            ['#' + this.interpolateDeadWaitColor(this.gameApiResult.team1Color, realBackgroundColor, 1), '#' + this.interpolateDeadWaitColor(this.gameApiResult.team2Color, realBackgroundColor, 1), '#999999'],
            ['#' + this.interpolateDeadWaitColor(this.gameApiResult.team1Color, realBackgroundColor, 2), '#' + this.interpolateDeadWaitColor(this.gameApiResult.team2Color, realBackgroundColor, 2), '#444444'],
          ],
        });
        this.colors.currentScheme = 0;
        this.colors.alive = this.colors.schemes[this.colors.currentScheme].alive;
        this.colors.deadWait = this.colors.schemes[this.colors.currentScheme].deadWait;

      } else {
        // Parse color options and pick out scheme
        this.colors.currentScheme = 0;

        this.colors.alive = this.colors.schemes[this.colors.currentScheme].alive;
        this.colors.deadWait = [
            ['#' + this.interpolateDeadWaitColor(this.colors.alive[0], realBackgroundColor, 1), '#' + this.interpolateDeadWaitColor(this.colors.alive[1], realBackgroundColor, 1), '#999999'],
            ['#' + this.interpolateDeadWaitColor(this.colors.alive[0], realBackgroundColor, 2), '#' + this.interpolateDeadWaitColor(this.colors.alive[1], realBackgroundColor, 2), '#444444'],
        ];
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

        // Assemble team abbr/colors/names
        var teamAbbrs = [this.gameApiResult.team1Abbr.toLowerCase(), this.gameApiResult.team2Abbr.toLowerCase()];
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
        /* we are all good
        this.columns  = this.mapApiResult.columns;
        this.rows     = this.mapApiResult.rows;
        this.cellSize = this.mapApiResult.cellSize;
         */
      } else {
        this.columns = this.getColsFromUrlSafely();
        this.rows = this.getRowsFromUrlSafely();
        this.cellSize = this.getCellSizeFromUrlSafely();
      }
    },

    /**
     * Parse the initial state variables s1/s2/s3.
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

      // state 1 parameter
      state1 = jsonParse(decodeURI(this.initialState1));
      var irow, icol, y;
      for (irow = 0; irow < state1.length; irow++) {
        for (y in state1[irow]) {
          for (icol = 0 ; icol < state1[irow][y].length ; icol++) {
            var yy = parseInt(y);
            var xx = state1[irow][yy][icol];
            color = 1;
            this.listLife.addAliveCell(xx, yy, color);
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
            if (!this.listLife.isAlive(xx, yy)) {
              color = 2;
              this.listLife.addAliveCell(xx, yy, color);
            }
          }
        }
      }

    },


    /**
     * Clean up actual state and prepare a new run
     */
    cleanUp : function() {
      this.listLife.init(); // Reset/init algorithm
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

        // Use vector magnitude to account for changes in all team scores
        var squareSum = 0;
        var r;
        for (r=0; r<GOL.colors.ncolors-1; r++) {
          squareSum += liveCounts.liveCellsColors[r]**2;
        }
        var rootSum = Math.sqrt(squareSum);

        // update running average window
        if (this.generation < maxDim) {
          // Keep populating the window...
          //
          // Use vector magnitude to account for changes in all team scores
          this.runningAvgWindow[this.generation] = rootSum;
        } else {
          // Push and pop newest/oldest values
          var removed = this.runningAvgWindow.shift();
          this.runningAvgWindow.push(rootSum);

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
            //
            //var diff01 = this.relativeDiff(this.runningAvgLast3[0], this.runningAvgLast3[1], tolStable);
            //var diff02 = this.relativeDiff(this.runningAvgLast3[1], this.runningAvgLast3[2], tolStable);
            var bool0eq1 = this.approxEqual(this.runningAvgLast3[0], this.runningAvgLast3[1], tolStable);
            var bool1eq2 = this.approxEqual(this.runningAvgLast3[1], this.runningAvgLast3[2], tolStable);
            var victoryByStability = ((bool0eq1 && bool1eq2) && (liveCounts.liveCells > 0));
            if (victoryByStability) {
              // Someone won due to the simulation becoming stable
              this.foundVictor = true;
              if (liveCounts.liveCellsColors[0] > liveCounts.liveCellsColors[1]) {
                this.whoWon = 1;
              } else if (liveCounts.liveCellsColors[1] > liveCounts.liveCellsColors[0]) {
                this.whoWon = 2;
              } else {
                this.whoWon = 0;
              }
              this.showWinnersLosers = true;
              this.handlers.buttons.run();
              this.running = false;
            }
          }
        } // end if gen > maxDim

        // Second way for a victor to be declared,
        // is to have all other teams get shut out.
        var victoryByShutout = false;

        /////////////////////////////////
        // hard-coded rules format
        var zeroScore = 0;
        var threshold = 1;
        var r;
        for (r=0; r<GOL.colors.ncolors-1; r++) {
          if (liveCounts.liveCellsColors[r] == 0) {
            zeroScore++;
          }
        }
        if (zeroScore >= threshold) {
          victoryByShutout = true;
        }
        // end hard-coded rules format
        //////////////////////////////////

        if (victoryByShutout) {
          // Someone won because everyone else died
          this.foundVictor = true;
          if (liveCounts.liveCellsColors[0] > liveCounts.liveCellsColors[1]) {
            this.whoWon = 1;
          } else if (liveCounts.liveCellsColors[1] > liveCounts.liveCellsColors[0]) {
            this.whoWon = 2;
          } else {
            this.whoWon = 0;
          }
          this.showWinnersLosers = true;
          this.handlers.buttons.run();
          this.running = false;
        }
      } // end if no victor found
    },

    /**
     * Update the statistics elements on the simulator page
     */
    updateStatisticsElements : function(liveCounts) {
      this.element.livecells.innerHTML  = liveCounts.liveCells;
      this.element.livecells1.innerHTML = liveCounts.liveCellsColors[0];
      this.element.livecells2.innerHTML = liveCounts.liveCellsColors[1];
      this.element.livecells3.innerHTML = liveCounts.liveCellsColors[2];
      this.element.livepct.innerHTML    = liveCounts.livePct.toFixed(1) + "%";
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
      this.element.livecells3 = document.getElementById('livecells3');

      this.element.team1wlrec = document.getElementById("team1record");
      this.element.team2wlrec = document.getElementById("team2record");
      this.element.team1wlrecCont = document.getElementById("team1record-container");
      this.element.team2wlrecCont = document.getElementById("team2record-container");

      this.element.livepct    = document.getElementById('livePct');

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
        var x, y, action, color;
        x = GOL.listLife.redrawList[i][0];
        y = GOL.listLife.redrawList[i][1];
        action = GOL.listLife.redrawList[i][2];
        color = GOL.listLife.redrawList[i][3];

        // Decide which action to take
        // TODO: this matches up with the current value of c, but update it so it can handle c != 4
        if (action === 1) {
          GOL.canvas.changeCelltoAlive(x, y, color);
        } else if (action === 2) {
          GOL.canvas.keepCellAlive(x, y, color);
        } else if (action === 3) {
          GOL.canvas.changeCelltoDeadWait(x, y, color, c=0);
        } else if (action === 4) {
          GOL.canvas.changeCelltoDeadWait(x, y, color, c=1);
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
          if (speed===0) {
            speed = 4;
          }
          GOL.element.speedSlider.value = speed;

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
         * Cycle through the color schemes.
         *
         * This function is only called when the user clicks the "Colors" button.
         */
        colorcycle : function() {
          if (GOL.colors.schemes.length > 1) {
            GOL.colors.currentScheme = (GOL.colors.currentScheme + 1) % GOL.colors.schemes.length;
            GOL.colors.alive = GOL.colors.schemes[GOL.colors.currentScheme].alive;
            GOL.colors.deadWait = [
                ['#' + GOL.interpolateDeadWaitColor(GOL.colors.alive[0], realBackgroundColor, 1), '#' + GOL.interpolateDeadWaitColor(GOL.colors.alive[1], realBackgroundColor, 1), '#999999'],
                ['#' + GOL.interpolateDeadWaitColor(GOL.colors.alive[0], realBackgroundColor, 2), '#' + GOL.interpolateDeadWaitColor(GOL.colors.alive[1], realBackgroundColor, 2), '#444444'],
            ];
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
          // We don't need to do anything with the
          // speed slider value here.
          // The getWaitTimeMs function will read
          // the value of the speed slider directly.
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
              this.drawCell(i, j, 1, GOL.listLife.getCellColor(i, j));
            } else if (GOL.listLife.isDeadWait(i, j, c=0)) {
              this.drawCell(i, j, 2, GOL.listLife.getDeadWaitColor(i, j, c=0));
            } else if (GOL.listLife.isDeadWait(i, j, c=1)) {
              this.drawCell(i, j, 3, GOL.listLife.getDeadWaitColor(i, j, c=1));
            } else {
              this.drawCell(i, j, 0);
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
      drawCell : function (i, j, aliveDeadState, color = -1) {

        if (aliveDeadState === 0) {

          // aliveDeadState = 0 means this cell is dead
          if (GOL.trail.current && this.age[i][j] < 0) {
            this.context.fillStyle = GOL.colors.trail[(this.age[i][j] * -1) % GOL.colors.trail.length];
          } else {
            this.context.fillStyle = GOL.colors.dead;
          }

        } else if (aliveDeadState === 1 ) {

          // aliveDeadState = 1 means this cell is normal-alive
          // (use alive colors)
          if (color === -1) {
            // look up this cell's color using state lists
            this.context.fillStyle = GOL.colors.alive[GOL.listLife.getCellColor(i, j) - 1];
          } else {
            // save time by using user-specified color
            this.context.fillStyle = GOL.colors.alive[color - 1];
          }

        } else {

          // Rules that specify a value for c will have dead/alive and c-2 remaining states
          // Calling this function with aliveDeadState > 1 will move cells to dead wait states
          c = aliveDeadState - 2;

          this.context.fillStyle = GOL.colors.deadWait[c][color - 1];
          // No default option for color, user must provide

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
        //////////////
        // TODO fix
        if (GOL.sandboxMode===true) {
          if (GOL.listLife.isAlive(i, j)) {
            // User can only paint two colors, no referee
            if (GOL.listLife.getCellColor(i, j) == 1) {
              // Swap colors
              GOL.listLife.removeCellFromCustomState(i, j, GOL.listLife.actualState, GOL.listLife.actualStateColors, 1);
              GOL.listLife.addCellToCustomState(i, j, GOL.listLife.actualState, GOL.listLife.actualStateColors, 2);
            } else if (GOL.listLife.getCellColor(i, j) == 2) {
              GOL.listLife.removeCellFromCustomState(i, j, GOL.listLife.actualState, GOL.listLife.actualStateColors, 2);
            }
          } else {
            GOL.listLife.addCellToCustomState(i, j, GOL.listLife.actualState, GOL.listLife.actualStateColors, 1);
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
      keepCellAlive : function(i, j, color = -1) {
        if (i >= 0 && i < GOL.columns && j >=0 && j < GOL.rows) {
          this.age[i][j]++;
          if (color === -1) {
            // default behavior: use current cell color
            color = GOL.listLife.getCellColor(i, j)
          }
          this.drawCell(i, j, 1, color);
        }
      },


      /**
       * changeCelltoAlive
       */
      changeCelltoAlive : function(i, j, color = -1) {
        if (i >= 0 && i < GOL.columns && j >=0 && j < GOL.rows) {
          this.age[i][j] = 1;
          if (color === -1) {
            // default behavior: use current cell color
            color = GOL.listLife.getCellColor(i, j)
          }
          this.drawCell(i, j, 1, color);
        }
      },


      /**
       * changeCelltoDead
       */
      changeCelltoDead : function(i, j) {
        if (i >= 0 && i < GOL.columns && j >=0 && j < GOL.rows) {
          // Age sign change should happen when cell perma-dies, not while in deadwait
          this.age[i][j] = -this.age[i][j]; // Keep trail
          this.drawCell(i, j, 0, 0);
        }
      },


      changeCelltoDeadWait : function(i, j, color, c = -1) {
        if (i >= 0 && i < GOL.columns && j >=0 && j < GOL.rows) {
          if (c>=0) {
            this.drawCell(i, j, 2+c, color);
          }
        }
      },


    },


    /** ****************************************************************************************************************************
     *
     */
    listLife : {

      redrawList : [],
      // Most other variables should be initialized using the init() function

      /**
       * Initialize variables
       */
      init : function () {

        // Alive cells.
        // This is a single state.
        // A state is an array of arrays.
        this.actualState = [];

        // Alive cell colors
        // TODO: use ncolors
        var actualStateColors1 = new Set();
        var actualStateColors2 = new Set();
        var actualStateColors3 = new Set();
        this.actualStateColors = [actualStateColors1, actualStateColors2, actualStateColors3];

        // Dead wait cells.
        // This is an array of states.
        // Each state is an array of arrays.
        // The number of dead wait states is c - 2.
        // The 2 accounts for alive/dead.
        this.deadWaitN = [];
        // Dead wait cell colors.
        // This is an array of arrays of 3 color sets.
        // Each set holds (x,y) points for that color, 3 total colors.
        this.deadWaitColorsN = [];
        var j;
        // 2 to account for alive/dead
        for(j=0; j<GOL.ruleParams.c-2; j++) {
          deadWaitj = [];
          this.deadWaitN.push(deadWaitj);

          // TODO: use ncolors
          deadWaitColorj1 = new Set();
          deadWaitColorj2 = new Set();
          deadWaitColorj3 = new Set();
          deadWaitColorj = [deadWaitColorj1, deadWaitColorj2, deadWaitColorj3];
          this.deadWaitColorsN.push(deadWaitColorj);
        }
      },

        /**
         * Iterate over each (x,y) point in the list life state "state",
         * accumulating the number of alive cells, and return
         * the grand total.
         */
      getStateCount : function(state) {

        var liveCells = 0;
        for (i = 0; i < state.length; i++) {
          if ((state[i][0] >= 0) && (state[i][0] < GOL.rows)) {
            for (j = 1; j < state[i].length; j++) {
              // shouldn't need these, but just to be sure.
              if ((state[i][j] >= 0) && (state[i][j] < GOL.columns)) {
                if ((state[i][0] >= 0) && (state[i][0] < GOL.rows)) {
                  liveCells++;
                }
              }
            }
          }
        }
        return liveCells;

      },


      /**
       * Return the number of alive cells, and a list of the number of alive cells
       * of each color. Returns other useful statistics and count information.
       */
      getLiveCounts : function() {
        var liveCells = GOL.listLife.getStateCount(GOL.listLife.actualState);

        var liveCellsSum = 0;
        var liveCellsColors = [];
        var r;
        for (r=0; r<GOL.colors.ncolors; r++) {
          var ncells = GOL.listLife.actualStateColors[r].size;
          liveCellsColors.push(ncells);
          liveCellsSum += ncells;
        }

        if (liveCells != liveCellsSum) {
          throw 'Error in getLiveCounts: liveCells='+liveCells+' but sum of individual liveCells is '+liveCellsSum;
        }

        var totalArea = GOL.columns * GOL.rows;
        var livePct = ((liveCellsSum)/(totalArea))*100.0;

        return {
          liveCells: liveCells,
          liveCellsColors : liveCellsColors,
          livePct : livePct,
        };
      },


      /**
       * The main driver method: advance the state of the simulator forward one generation.
       */
      nextGeneration : function() {

        var x, xm1, xp1, y, ym1, yp1;
        var i, j, m, n, key, t1, t2;
        var alive = 0, alive1 = 0, alive2 = 0;
        var deadNeighbors;

        // new state that will replace actual state
        var newActualState = [];

        var newActualStateColors = [];
        var r;
        for (r=0; r<GOL.colors.ncolors; r++) {
          var colorN = new Set();
          newActualStateColors.push(colorN);
        }

        // array of states
        var newDeadWaitN = [];
        // array of arrays of 3 color sets
        var newDeadWaitColorsN = [];
        var j;
        // 2 to account for alive/dead
        for(j=0; j<GOL.ruleParams.c-2; j++) {
          newDeadWaitj = [];
          newDeadWaitN.push(newDeadWaitj);

          // TODO: use ncolors
          newDeadWaitColorj1 = new Set();
          newDeadWaitColorj2 = new Set();
          newDeadWaitColorj3 = new Set();
          newDeadWaitColorj = [newDeadWaitColorj1, newDeadWaitColorj2, newDeadWaitColorj3];
          newDeadWaitColorsN.push(newDeadWaitColorj);
        }

        var allDeadNeighbors = {};
        var neighbors, color, result;

        this.redrawList = [];


        // iterate over each alive cell (iterate over actualState list)
        // this is the SURVIVE step
        var y, ym1, yp1;
        for (i = 0; i < this.actualState.length; i++) {

          y = this.actualState[i][0];
          yp1 = this.periodicNormalizey(y+1);
          ym1 = this.periodicNormalizey(y-1);

          var x, xm1, xp1;
          var kx, kxm1, kxp1;
          for (j = 1; j < this.actualState[i].length; j++) {

            x = this.actualState[i][j];
            xp1 = this.periodicNormalizex(x+1);
            xm1 = this.periodicNormalizex(x-1);

            x = this.periodicNormalizex(x);
            y = this.periodicNormalizey(y);

            // Possible dead neighbors
            deadNeighbors = [[xm1, ym1, 1], [x, ym1, 1], [xp1, ym1, 1], [xm1, y, 1], [xp1, y, 1], [xm1, yp1, 1], [x, yp1, 1], [xp1, yp1, 1]];

            // Get number of alive neighbors, and set alive neighbors in deadNeighbors to undefined.
            // The star wars CA uses majority rule to determine color.
            // In case of a tie, use existing color.
            result = this.getNeighborsFromAlive(x, y, deadNeighbors);
            neighbors = result['neighbors'];

            // Majority wins, use color returned by getNeighborsFromAlive
            color = result['color'];

            // (Note: rejected the color-preserving method for star wars CA
            // because it is impossible for it to stabilize.)

            // Iterate over each dead cell (in the vicinity of alive cells),
            // and check how many times this dead cell shows up as a live cell neighbor.
            // If it has the right number of neighbors, it will come to life.
            for (m = 0; m < 8; m++) {

              // If undefined, it means cell is a dead neighbor
              if (deadNeighbors[m] !== undefined) {

                var xx = deadNeighbors[m][0];
                var yy = deadNeighbors[m][1];

                // Star Wars introduces an additional 2-gen wait
                // If cell is in dead wait state,
                // it can't be born yet, so skip this.
                if (!this.isDeadWait(xx, yy)) {
                  key = xx + ',' + yy; // Create hashtable key
                  // accumulate number of neighbors for each dead cell
                  if (allDeadNeighbors[key] === undefined) {
                    allDeadNeighbors[key] = 1;
                  } else {
                    allDeadNeighbors[key]++;
                  }
                }
              }
            }

            ///////////////////////////////
            // SURVIVE counts
            //
            // star wars

            var cellSurvives = false;
            var k;
            for (k=0; k<GOL.ruleParams.s.length; k++) {
              if (neighbors===GOL.ruleParams.s[k]) {
                cellSurvives = true;
              }
            }
            if (cellSurvives) {
              // Keep cell alive

              // NOTE: on rainbow math map, cells are laid out on a grid
              // but there are no cells at grid line intersections,
              // and cells never have more than 2 neighbors.
              // star wars b2/s345 means every cell dies in the first step.

              // previously: called addCell() for alive state, and then for corresponding color state
              // when finished, called redrawList.push with action 2
              this.addCellToCustomState(x, y, newActualState, newActualStateColors, color);
              var redrawAction = 2; // keep alive
              this.redrawList.push([x, y, redrawAction, color]);
            } else {
              // Kill cell

              // previously: called addCell() for newDeadWaitTwo, and for corresponding color version
              // when finished, called redrawList.push with action 3

              // uhhhhhh... newActualState is gonna be empty most of the time.
              // How can we call removeCellFromState on newActualState if it has no cells?
              // We can't. There is no point to calling remove cell here.
              //this.removeCellFromCustomState(x, y, newActualState, newActualStateColors, color);

              // Add it to the dead wait
              var firstPhase = 0;
              this.addCellToCustomState(x, y, newDeadWaitN[firstPhase], newDeadWaitColorsN[firstPhase], color);
              var redrawAction = 3; // 0=dead, 1=alive, 2=keep alive, 3=first phase of dead wait
              this.redrawList.push([x, y, redrawAction, color]);
            }

          }
        }

        // Iterate over dead neighbors and determine if any will be born
        // (allDeadNeighbors only contains cells not in deadWait)
        // This is the birth step
        for (key in allDeadNeighbors) {

          var neighbors = allDeadNeighbors[key];

          /////////////////////////////////
          // BIRTH counts
          //
          // star wars
          var cellBorn = false;
          var k;
          for (k=0; k<GOL.ruleParams.b.length; k++) {
            if (neighbors==GOL.ruleParams.b[k]) {
              cellBorn = true;
            }
          }
          if (cellBorn) {
            // This cell is dead, and not deadWait,
            // and it has enough alive neighbors to be born.
            key = key.split(',');

            // Parse the (x, y) values of the birthed cell
            t1 = parseInt(key[0], 10);
            t2 = parseInt(key[1], 10);

            // Get color of (x, y) cell
            color = this.getColorFromAlive(t1, t2);

            // previously: just called addCell with newState
            this.addCellToCustomState(t1, t2, newActualState, newActualStateColors, color);
            this.redrawList.push([t1, t2, 1, color]); // Bring to life (action 1)

          }
        }

        ///////////////////////////////
        // deadWait cycling:
        //
        // Iterate over all cells in last dead wait state, and kill.
        // Shift other dead wait states by 1, and redraw them as such.
        // The newest dead wait cells are already in the redraw list.

        // Iterate over all cells in the last dead wait state and kill them
        // (-2 accounts for alive/dead state, not in the deadWaitN list)
        var cmaxIndex = (GOL.ruleParams.c - 1) - 2;
        var i, j;
        for (i = 0; i < this.deadWaitN[cmaxIndex].length; i++) {
          for (j = 1; j < this.deadWaitN[cmaxIndex][i].length; j++) {
            x = this.deadWaitN[cmaxIndex][i][j];
            y = this.deadWaitN[cmaxIndex][i][0];
            this.redrawList.push([x, y, 0, 0]); // action 0: perma-kill
            // Nothing should be done here with new dead wait
          }
        }

        // Iterate backwards over each dead wait state, copying current dead wait N-1 into new dead wait N
        // Add each cell that changes dead wait states to a redraw list.
        // Note: newDeadWaitColorsN[0] is populated in survive step, so no need to cover c=0 in loop.
        var ncolors = 3;
        var c;
        for (c = cmaxIndex; c > 0; c--) {

          // Shift dead wait N-1 back to N
          var cm1 = c - 1;

          // Set the new dead wait for phase c to the current (old) dead wait at phase c-1
          newDeadWaitN[c] = JSON.parse(JSON.stringify(this.deadWaitN[cm1]));

          // set new dead weight color sets to old dead weight color sets of prior step
          var colorSets = [];
          var color0;
          for (color0=0; color0<ncolors; color0++) {
            var colorSet = new Set(this.deadWaitColorsN[cm1][color0]);
            colorSets.push(colorSet);
          }
          newDeadWaitColorsN[c] = colorSets;

          // Generalize this for all c values
          // 0=die, 1=birth, 2=keep alive, 3=death phase 1, 4=death phase 2, 5=death phase 3,...
          // death phase c+1 ==> redrawAction=3+c
          var redrawAction = 3+c;

          // Add every cell that changed dead wait states to the redraw list
          var i, j;
          state = newDeadWaitN[c];
          for (i=0; i<state.length; i++) {
            for (j=1; j<state[i].length; j++) {
              x = state[i][j];
              y = state[i][0];
              cellColor = -1;
              repr = "(" + x + "," + y + ")";
              // Need to get cell color before we can redraw
              var color0;
              for (color0=0; color0<ncolors; color0++) {
                if (newDeadWaitColorsN[c][color0].has(repr)) {
                  cellColor = color0 + 1;
                }
              }
              if (cellColor > 0) {
                this.redrawList.push([x, y, redrawAction, cellColor]);
              }
            }
          }

        } // end loop over dead wait states

        ///////////////////////////
        // done, now update
        this.actualState = newActualState;
        //this.actualState = JSON.parse(JSON.stringify(newActualState));
        this.actualStateColors = newActualStateColors;

        this.deadWaitN = newDeadWaitN;
        //this.deadWaitN = JSON.parse(JSON.stringify(newDeadWaitN));
        this.deadWaitColorsN = newDeadWaitColorsN;

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
       * Count the number of dead wait neighbors of cell (x,y)
       * that have the specified color.
       */
      getColorCountsFromDeadWait(x, y, color) {
        var color0 = color - 1;
        var deadWaitCount = 0;
        // periodic grid: loop points back around
        var x = this.periodicNormalizex(x);
        var y = this.periodicNormalizey(y);
        var c;
        // 2 to account for alive/dead
        for (c=0; c<GOL.ruleParams.c-2; c++) {
          points = this.deadWaitColorsN[c][color0];
          var ii, jj, xx, yy;
          for (iy=-1; iy<=1; iy++) {
            for (ix=-1; ix<=1; ix++) {
              if (!(ix==0 && iy==0)) {
                xx = x + ix;
                xx = this.periodicNormalizex(xx);
                yy = y + iy;
                yy = this.periodicNormalizey(yy);
                repr = "(" + xx + "," + yy + ")";
                if (points.has(repr)) {
                  deadWaitCount++;
                }
              }
            }
          }
        }
        return deadWaitCount;
      },

      /**
       * Count the number of alive neighbors of cell (x,y)
       * that have the specified color.
       */
      getColorCountsFromAlive : function(x, y, color) {
        var myTimer = Date.now();
        var color0 = color-1;
        var aliveCount = 0;
        // periodic grid: loop points back around
        var x = this.periodicNormalizex(x);
        var y = this.periodicNormalizey(y);
        var points = this.actualStateColors[color0];
        var ix, iy;
        for (iy=-1; iy<=1; iy++) {
          for (ix=-1; ix<=1; ix++) {
            if (!(ix==0 && iy==0)) {
              xx = x + ix;
              xx = this.periodicNormalizex(xx);
              yy = y + iy;
              yy = this.periodicNormalizey(yy);
              repr = "(" + xx + "," + yy + ")";
              if (points.has(repr)) {
                aliveCount++;
              }
            }
          }
        }
        return aliveCount;
      },


      /**
       * Count the number of alive neighbors of cell (x,y)
       * that have the specified color, and eliminate them
       * from possibleDeadNeighborsList.
       */
      getColorCountsFromPossibleNeighbors : function(x, y, color, possibleDeadNeighborsList) {
        var color0 = color-1;
        var count = 0;
        // z iterates over every possible neighbor.
        // ix/iy loop must be in same order as deadNeighbors var in nextGeneration.
        var z = 0;
        var points = this.actualStateColors[color0];
        for (iy=-1; iy<=1; iy++) {
          for (ix=-1; ix<=1; ix++) {
            if (!(ix==0 && iy==0)) {
              xx = x + ix;
              xx = this.periodicNormalizex(xx);
              yy = y + iy;
              yy = this.periodicNormalizey(yy);
              repr = "(" + xx + "," + yy + ")";
              if (points.has(repr)) {
                // possibleDeadNeighbors[z][0 and 1] must equal x and y
                // for the following to be a valid action...
                possibleDeadNeighborsList[z] = undefined;
                count++;
              }
              z++;
            }
          }
        }
        return count;
      },


      /**
       * Check if the cell at location (x, y) is alive
       */
      isAlive : function(x, y, debug=false) {
        // periodic grid: loop points back around
        var x = this.periodicNormalizex(x);
        var y = this.periodicNormalizey(y);
        var repr = "(" + x + "," + y + ")";
        if (debug) {
          console.log(repr);
        }
        // Loop over each color (this method doesn't care about color)
        var color0;
        var ncolors = 3;
        var points;
        for (color0=0; color0 < ncolors; color0++) {
          points = this.actualStateColors[color0];
          if (points.has(repr)) {
            return true;
          }
        }
        return false;
      },

      /**
       * Check if the cell at location (x, y) is in a dead wait state.
       * If the index c (zero-indexed) is specified, only check that dead wait state.
       */
      isDeadWait : function(x, y, c = -1) {
        // periodic grid: loop points back around
        var x = this.periodicNormalizex(x);
        var y = this.periodicNormalizey(y);
        var repr = "(" + x + "," + y + ")";

        // Loop over each dead wait state (c parameter), or just the one specified
        var cmin, cmax;
        if (c<0) {
          cmin = 0;
          cmax = GOL.ruleParams.c - 2; // -2 comes from accounting for alive/dead
        } else {
          cmin = c;
          cmax = c + 1;
        }

        for (ic=cmin; ic<cmax; ic++) {
          // Also loop over each color (this method doesn't care about color)
          var color0;
          var ncolors = 3;
          for (color0=0; color0 < ncolors; color0++) {
            points = this.deadWaitColorsN[ic][color0];
            if (points.has(repr)) {
              return true;
            }
          }
        }
        return false;
      },


      /*
       * Determine the color of a birthed cell.
       * Performs tie-breaker determination.
       *
       * Note: This method is only called when
       * cell (x,y) is dead but has enough neighbors
       * to become alive.
       *
       * This method isn't checking whether the cell
       * should be birthed, it's just checking what
       * color the birthed cell would be.
       *
       */
      getColorFromAlive : function(x, y) {

        // Loop points back around
        x = this.periodicNormalizex(x);
        y = this.periodicNormalizey(y);

        // TODO: use ncolors
        var color1, color2, color3;
        color1 = this.getColorCountsFromAlive(x, y, 1);
        color2 = this.getColorCountsFromAlive(x, y, 2);
        color3 = this.getColorCountsFromAlive(x, y, 3);

        // return value
        var color = 0;

        // Determine color of a new birthed cell by determining
        // number of neighbors of each color, and majority color.
        //
        // This cell is currently dead, so this check is
        // slightly different from the check for live cells.

        var ns = color1+color2;
        var nsa = color1+color2+color3;

        // Only consider case where number of neighbors > 0
        // (otherwise cell stays dead)
        if (nsa > 0) {

          // Only consider case where number of non-referee neighbors > 0
          if (ns > 0) {

            var maxNeighbor = Math.max(color1, color2);
            if ((maxNeighbor==color1) && (color1 > color2)) {
              color = 1;
            } else if ((maxNeighbor==color2) && (color2 >  color1)) {
              color = 2;
            } else {
              // We have a tie:
              // We could repeat the same procedure as above but including dead wait cells,
              // or we could take the easy way out and add this new cell to the referees.
              color = 3;
            }

          } else {
            // No live non-referee neighbors
            color = 3;
          } // end if ns > 0

        } else {
          // No live neighbors
          color = 0;
        } // end if nsa > 0

        return color;

      },

      /*
       * Determine the number of neighbor cells
       * of an alive cell (x,y) that are alive.
       *
       * Currently, we also check deadWait colors and count them too.
       *
       * Input arguments:
       * - possibleNeighborsList: list of possible (x, y) dead neighbors
       *
       * Algorithm:
       * - iterate over each possible dead neighbor coordinate
       * - set the coordinate to undefined if neighbor is alive
       * - accumulate an alive neighbors counter for each color
       * - use color counters to determine final color
       *
       */
      getNeighborsFromAlive : function (x, y, possibleNeighborsList) {

        state = this.actualState;

        // Loop points back around
        x = this.periodicNormalizex(x);
        y = this.periodicNormalizey(y);

        // TODO: use ncolors
        var neighbors1, neighbors2, neighbors3;
        neighbors1 = this.getColorCountsFromPossibleNeighbors(x, y, 1, possibleNeighborsList);
        neighbors2 = this.getColorCountsFromPossibleNeighbors(x, y, 2, possibleNeighborsList);
        neighbors3 = this.getColorCountsFromPossibleNeighbors(x, y, 3, possibleNeighborsList);
        var neighbors = neighbors1+neighbors2+neighbors3;

        // Used in tiebreakers
        var neighborsdw1, neighborsdw2;
        neighborsdw1 = this.getColorCountsFromDeadWait(x, y, 1);
        neighborsdw2 = this.getColorCountsFromDeadWait(x, y, 2);

        // Determine number of neighbors, and majority color.
        // This procedure is only applied to surviving cells.
        //
        // General cellular automata survival:
        //
        // With a third referee team,
        // we can use a majority rules approach,
        // and add teams to the referees if tie.
        //
        // Star Wars surival rule is S345
        //
        // S3:
        // AAA -> A
        // AAB -> A
        // ABR -> Refs
        //
        // S4:
        // AAAA -> A
        // AAAB -> A
        // AABB -> Refs
        // AABR -> A
        //
        // S5:
        // AAAAA -> A
        // AAAAB -> A
        // AAABB -> A
        // AAABR -> A
        // AABRR -> A
        // AABBR -> Refs
        // ABRRR -> Refs

        // This is the final color returned
        // 0 means no alive colors/cells
        // 1,2,3 means color 1,2,3
        // -1 means tie
        var color = 0;

        var numNeighborsAll = neighbors1+neighbors2+neighbors3;
        var numNeighbors = neighbors1+neighbors2;

        // Check if any neighbors are alive
        if (numNeighborsAll > 0) {

          // Check if any alive neighbors are non-referees
          if (numNeighbors > 0) {

            // Only goal is to determine if there is a tie,
            // which means two or more teams have value
            // equal to max(neighbors1, neighbors2)
            var maxNeighbor = Math.max(neighbors1, neighbors2);
            var numEqualToMax = 0;
            if (neighbors1==maxNeighbor) {
              numEqualToMax++;
              color = 1;
            }
            if (neighbors2==maxNeighbor) {
              numEqualToMax++;
              color = 2;
            }

            // TODO: ncolors - 1 (non-refs)
            if (numEqualToMax==2) {

              // Two colors have the maximum number of neighbors, so we have a tie.
              // Repeat same procedure as above, but now use counts INCLUDING dead weight cells.
              var maxNeighborDw = Math.max(neighbors1+neighborsdw1, neighbors2+neighborsdw2);
              //var maxNeighborDw = Math.max(neighborsdw1, neighborsdw2);
              var numEqualToMaxDw = 0;
              //if (neighborsdw1==maxNeighborDw)
              if (neighbors1+neighborsdw1==maxNeighborDw) {
                numEqualToMaxDw++;
                color = 1;
              }
              //if (neighborsdw2==maxNeighborDw)
              if (neighbors2+neighborsdw2==maxNeighborDw) {
                numEqualToMaxDw++;
                color = 2;
              }


              if (numEqualToMaxDw==2) {
                // We STILL have a tie, when taking into account
                // the number of deadWait neighbors.
                color = -1;

              } // end if tie in tiebreaker too

            } // end if tie

          } else {
            // All alive neighbors are referees, so a tie
            color = -1;
          }

        } else {
          // Cell is all alone, keep same color
          color = -1;
        }

        // Deal with color of -1 by keeping same color
        if (color < 0) {
          color = this.getCellColor(x, y);
        }

        // Hold up.
        // If getCellColor(x,y) returns 0,
        // this cell is dead.
        // If this cell is dead, we're calling this
        // function wrong - it should only be called
        // on live cells.

        return {
          neighbors: neighbors,
          color: color
        }
      },


      /**
       * Check if the cell at location (x, y)
       * is in the given state
       */
      checkCellInState: function(x, y, state) {

        // Loop points back around
        x = (x + GOL.columns)%(GOL.columns);
        y = (y + GOL.rows)%(GOL.rows);

        var i, j;

        for (i = 0; i < state.length; i++) {
          // check that first coordinate matches
          if (state[i][0] === y) {
            for (j = 1; j < state[i].length; j++) {
              // check that second coordinate matches
              if (state[i][j] === x) {
                return true;
              }
            }
          }
        }
        return false;
      },


      /**
       * Get the color of the cell at location (x, y)
       * (assumes cell is alive, returns 0 if cell was not found)
       */
      getCellColor : function(x, y) {
        // periodic grid: loop points back around
        var x = this.periodicNormalizex(x);
        var y = this.periodicNormalizey(y);
        var repr = "(" + x + "," + y + ")";
        var ncolors = 3;
        var color0;
        for (color0=0; color0 < ncolors; color0++) {
          var points = this.actualStateColors[color0];
          if (points.has(repr)) {
            return color0+1;
          }
        }
        return 0;
      },


      getDeadWaitColor : function(x, y, c = -1) {
        // periodic grid: loop points back around
        var x = this.periodicNormalizex(x);
        var y = this.periodicNormalizey(y);
        var repr = "(" + x + "," + y + ")";

        // Loop over each dead wait state (c parameter), or just the one specified
        var cmin, cmax;
        if (c<0) {
          // Do all c values
          cmin = 0;
          cmax = GOL.ruleParams.c - 2; // -2 comes from accounting for alive/dead
        } else {
          // Only do the c value specified
          cmin = c;
          cmax = c + 1;
        }

        for (ic=cmin; ic<cmax; ic++) {
          // Loop over each color to find which color contains this point
          var ncolors = 3;
          var color0;
          for (color0=0; color0 < ncolors; color0++) {
            var points = this.deadWaitColorsN[ic][color0];
            if (points.has(repr)) {
              return color0+1;
            }
          }
        }
        return 0;
      },


      /**
       * remove a cell from the alive state (actualState),
       * and remove from the set of points with the corresponding color.
       */
      removeNotAliveCell : function(x, y, color) {
        this.removeCellFromCustomState(x, y, this.actualState, this.actualStateColors, color);
      },


      /**
       * same as above, but for a custom state.
       */
      removeCellFromCustomState : function(x, y, state, colorSet, color) {
        color0 = color - 1;
        // TODO: use ncolors
        if((color0 >= 0) && (color0 < 3)) {
          // Remove point from alive state
          this._removeCell(x, y, state);
          // Remove point repr from color set
          var repr = "(" + x + "," + y + ")";
          colorSet[color0].delete(repr);
        } else {
          throw "removeCellFromCustomState() called for cell " + x + "," + y + " with invalid color "+color;
        }
      },


      /**
       * add a cell to the alive state (actualState),
       * and add to the set of points with the corresponding color.
       *
       * Parameters:
       * - aliveState is the state array to add (x,y) to
       * - color is the color of the cell (1, 2, 3)
       */
      addAliveCell : function(x, y, color) {
        this.addCellToCustomState(x, y, this.actualState, this.actualStateColors, color);
      },


      /**
       * same as above, but for a custom state.
       */
      addCellToCustomState : function(x, y, state, colorSet, color) {
        color0 = color - 1;
        // TODO: use ncolors
        if((color0 >= 0) && (color0 < 3)) {

          // Add to alive state
          this._addCell(x, y, state);

          // Add this point to the set of points for the specified color
          // TODO: make this a function
          var repr = "(" + x + "," + y + ")";

          // Verify we don't already have this cell in another color
          var r;
          for (r=0; r<GOL.colors.ncolors; r++) {
            if (r!=color0) {
              if (colorSet[r].has(repr)) {
                throw "addCellToCustomState() asked to add a duplicate cell from color "+(r+1)+" to color "+color;
              }
            }
          }

          // Add this point to the set of points for the specified color
          colorSet[color0].add(repr);

        } else {
          throw "addCellToCustomState() called with invalid color "+color;
        }
      },


      /**
       * Add a cell at (x,y) to the given state array
       */
      _addCell : function(x, y, state) {

        // Loop points back around
        x = this.periodicNormalizex(x);
        y = this.periodicNormalizey(y);

        if (state.length === 0) {
          state.push([y, x]);
          return;
        }

        var k, n, m, tempRow, newState = [], added;

        // figure out where in the list to insert the new cell
        if (y < state[0][0]) {
          // handle case of y < any other y, so add to beginning of list

          // set first element of newState and bump everybody else by 1
          newState = [[y,x]];
          for (k = 0; k < state.length; k++) {
            newState[k+1] = state[k];
          }

          // copy newState to state
          for (k = 0; k < newState.length; k++) {
            state[k] = newState[k];
          }

          return;

        } else if (y > state[state.length - 1][0]) {
          // handle case of y > any other y, so add to end
          state[state.length] = [y, x];
          return;

        } else { // Add to Middle

          for (n = 0; n < state.length; n++) {
            if (state[n][0] === y) { // Level Exists
              tempRow = [];
              added = false;
              for (m = 1; m < state[n].length; m++) {
                if ((!added) && (x < state[n][m])) {
                  tempRow.push(x);
                  added = !added;
                }
                tempRow.push(state[n][m]);
              }
              tempRow.unshift(y);
              if (!added) {
                tempRow.push(x);
              }
              state[n] = tempRow;
              return;
            }

            if (y < state[n][0]) { // Create Level
              newState = [];
              for (k = 0; k < state.length; k++) {
                if (k === n) {
                  newState[k] = [y,x];
                  newState[k+1] = state[k];
                } else if (k < n) {
                  newState[k] = state[k];
                } else if (k > n) {
                  newState[k+1] = state[k];
                }
              }

              for (k = 0; k < newState.length; k++) {
                state[k] = newState[k];
              }

              return;
            }
          }
        }
      },

      /**
       * Remove the cell at (x,y) from the given state array
       */
      _removeCell : function(x, y, state) {

        // Loop points back around
        x = this.periodicNormalizex(x);
        y = this.periodicNormalizey(y);

        var i, j;

        for (i = 0; i < state.length; i++) {
          if (state[i][0] === y) {
            if (state[i].length === 2) { // Remove all Row
              state.splice(i, 1);
            } else { // Remove Element
              for (j = 1; j < state[i].length; j++) {
                if (state[i][j] === x) {
                  state[i].splice(j, 1);
                  return;
                }
              }
            }
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

      getWaitTimeMs : function () {
        var j = 0;
        var default_ = 500;
        try {
          j = GOL.element.speedSlider.value;
        } catch {
          // console.log("Could not read speed-slider value, using default value of 25 ms");
          return default_;
        }
        if (j<=0) {
          return 0;
        } else if (j==1) {
          return 3;
        } else if (j==2) {
          return 15;
        } else if (j==3) {
          return 50;
        } else if (j==4) {
          return 200;
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
