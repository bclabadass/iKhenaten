// A trade caravan carries 800 (8 loads of 100), as in the original. The port used upstream's remake roll, a random
// capacity from 100 to 800 units, so caravans came with odd, often small amounts (200-300 at Abdjedu, Brendan). The
// original's caravan ("Original Pharaoh trade caravan" in Enhanced options: fixed 800, buy and sell each tick) is
// now the default; the option still turns it off, and "Larger trader capacity" still raises the ceiling.
// Markers:
//   [test-marker] og_trader_by_default
//   [test-marker] caravans_carry_800

function run_test() {
    test_reload_city_session('data/default.map')
    // The built-in default, not this machine's akhenaten.conf.
    var saved = game_features.get('gameplay_og_trader')
    __test_game_feature_reset('gameplay_og_trader')
    var og = game_features.get('gameplay_og_trader') === true
    __log_info_native('[test:344] original trader by default: ' + og)
    if (og) {
        __log_marker('og_trader_by_default')
    }

    city.figures.remove_figures(FIGURE_TRADE_CARAVAN)
    var caps = []
    for (var i = 0; i < 20; i++) {
        var fid = test_figure_create(FIGURE_TRADE_CARAVAN)
        caps.push(__test_trader_capacity(fid))
    }
    city.figures.remove_figures(FIGURE_TRADE_CARAVAN)
    var all_800 = caps.every(function (c) { return c == 800 })
    __log_info_native('[test:344] caravan capacities: ' + caps.join(' '))
    if (all_800) {
        __log_marker('caravans_carry_800')
    }
    game_features.set('gameplay_og_trader', saved)
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] og_trader_by_default')
        && __test_find_inlog('[test-marker] caravans_carry_800')
}
