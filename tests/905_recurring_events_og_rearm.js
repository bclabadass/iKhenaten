// A mission's recurring events come back as in the original (event_manager.c scenario_events_rearm): once one fires,
// its year moves on by the years since the start, so from year 5 it comes in years 5, 10, 20, 40. The mission scripts
// fired them every year: on Saqqara a gold mine collapse, a wage cut and a sandstorm came every January (Brendan).
// Markers:
//   [test-marker] t905_collapse_og_years
//   [test-marker] t905_wages_og_years

function t905_years(handler, key) {
    var fired = []
    mission[key] = -1
    for (var y = 0; y <= 40; y++) {
        var before = mission[key]
        handler({ years_since_start: y, month: 0 })
        if (mission[key] != before) {
            fired.push(y)
        }
    }
    return fired
}

function run_test() {
    __game_load_mission(10, 1)
    __test_pump_frames(3)
    var collapse = t905_years(mission10_gold_mine_collapse_early, 'gold_collapse_early_last_year')
    var wages = t905_years(mission10_wage_decrease, 'wage_decrease_last_year')
    __log_info_native('[test:905] Saqqara January events: gold mine collapse ' + JSON.stringify(collapse)
        + ', wage cut ' + JSON.stringify(wages))
    if (JSON.stringify(collapse) == '[5,10,20,40]') {
        __log_marker('t905_collapse_og_years')
    }
    if (JSON.stringify(wages) == '[7,14,28]') {
        __log_marker('t905_wages_og_years')
    }
    test_reload_city_session('data/default.map')
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] t905_collapse_og_years')
        && __test_find_inlog('[test-marker] t905_wages_og_years')
}
