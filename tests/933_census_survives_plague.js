// The census follows the houses through a plague (Brendan, 2026-11-26, Saqqara 6: "population never recovering after
// disease strikes ... leading to systematic collapse of the industries and mass fires/collapses").
// Plague deaths leave the census alone; the check every 8 days takes the difference off the census but did not
// recount it, so each check took the whole difference again. A plague stops migration (sick houses take nobody),
// so nothing recounted it in between: on Saqqara 6 one outbreak left 423 in the census for 1716 people in houses,
// the workforce (taken from the census) fell to a third and never came back.
// Markers:
//   [test-marker] t933_census_follows_houses
//   [test-marker] t933_save_census_follows_houses
//   [test-marker] t933_save_skipped

function t933_census_sum() {
    var sum = 0
    for (var age = 0; age < 100; age++) {
        sum += __city_population_at_age(age)
    }
    return sum
}

function t933_house_people(plague_days, keep_percent) {
    var total = 0
    for (var i = 1; i < 4000; i++) {
        var p = __test_house_population(i)
        if (p < 0 || !city.get_building(i).is_main) {
            continue
        }
        if (plague_days > 0 && p > 0) {
            p = __test_house_set_population(i, Math.floor(p * keep_percent / 100))
            __test_house_mark_plague(i, plague_days)
        }
        total += p
    }
    return total
}

function t933_map() {
    test_reload_city_session('data/default.map')
    var bid = test_building_place(BUILDING_HOUSE_CRUDE_HUT, -1, -1) || __test_building_create(BUILDING_HOUSE_CRUDE_HUT, -1, -1)
    if (!bid) {
        __log_info_native('[test:933] FAIL no house placed')
        return
    }
    __test_house_set_population(bid, 40)
    for (var age = 0; age < 100; age++) {
        __city_population_set_at_age(age, age == 30 ? 100 : 0)
    }
    __test_set_city_population(100)
    var houses = t933_house_people(0, 100)
    for (var i = 0; i < 3; i++) {
        __test_population_check_consistency()
    }
    var census = t933_census_sum()
    __log_info_native('[test:933] map: ' + houses + ' in houses, census 100 -> ' + census + ' (total ' + city.population + ') after 3 checks')
    if (census == houses && city.population == houses) {
        __log_marker('t933_census_follows_houses')
    }
}

function t933_save() {
    if (!__game_load_savegame(__test_data_dir() + '/Save/DuoSaves/Saqqara 6.svx')) {
        __log_marker('t933_save_skipped')
        return
    }
    __test_pump_frames(1)
    var before = t933_census_sum()
    var houses = t933_house_people(60, 80)
    __test_run_ticks(40 * 50)
    var after_houses = t933_house_people(0, 100)
    var census = t933_census_sum()
    __log_info_native('[test:933] Saqqara 6: census ' + before + ', plague leaves ' + houses + ' in houses; 40 days on: ' + after_houses + ' in houses, census ' + census + ' (total ' + city.population + ')')
    if (census >= after_houses && census <= houses) {
        __log_marker('t933_save_census_follows_houses')
    }
}

function run_test() {
    t933_map()
    t933_save()
    test_reload_city_session('data/default.map')
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] t933_census_follows_houses')
        && (__test_find_inlog('[test-marker] t933_save_census_follows_houses') || __test_find_inlog('[test-marker] t933_save_skipped'))
}
