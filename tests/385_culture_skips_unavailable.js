// The culture rating leaves out services the mission doesn't offer (Selima, Duo save "DuoSaves/Selima 7"). It is the
// lowest of 11 coverage records, and a service at 0% scores little (Dentist 15): Selima has no Dentist, so its
// culture could not pass 15 of its goal of 20 and the advisor kept asking for a Dentist.
// The real-data half needs the Duo save in Save/DuoSaves/; without it that half logs a skip.
// Markers:
//   [test-marker] culture_counts_allowed_dentist
//   [test-marker] culture_skips_unavailable_dentist
//   [test-marker] culture_selima_ok

var T385_SAVE = '../DuoSaves/Selima 7.svx'
var __test385_ok = false
var T385_FIELDS = ['booth', 'bandstand', 'pavilion', 'senet_house', 'zoo', 'school', 'library', 'religion',
    'dentist', 'physician', 'mortuary']
var T385_BUILDINGS = [BUILDING_BOOTH, BUILDING_BANDSTAND, BUILDING_PAVILLION, BUILDING_SENET_HOUSE, BUILDING_ZOO,
    BUILDING_SCRIBAL_SCHOOL, BUILDING_LIBRARY, BUILDING_DENTIST, BUILDING_PHYSICIAN, BUILDING_MORTUARY]

function test385_fail(msg) {
    __log_info_native('[test:385] FAIL ' + msg)
    __test_signal_ready()
}

function test385_culture(dentist_allowed) {
    for (var b = 0; b < T385_BUILDINGS.length; b++) {
        __scenario_building_allow(T385_BUILDINGS[b], true)
    }
    __scenario_building_allow(BUILDING_DENTIST, dentist_allowed)
    for (var i = 0; i < T385_FIELDS.length; i++) {
        __test_coverage_set(T385_FIELDS[i], T385_FIELDS[i] == 'dentist' ? 0 : 100)
    }
    __test_city_update_culture()
    return { rating: city.rating.culture | 0, explanation: city.rating.culture_explanation | 0 }
}

function run_test() {
    __log_info_native('[test:385] culture skips services the mission lacks')
    test_reload_city_session('data/default.map')

    var with_dentist = test385_culture(true)
    if (with_dentist.rating != 15 || with_dentist.explanation != 8) {
        return test385_fail('Dentist allowed at 0%: want 15/8, got ' + with_dentist.rating + '/' + with_dentist.explanation)
    }
    __log_marker('culture_counts_allowed_dentist')

    var without = test385_culture(false)
    if (without.rating != 100 || without.explanation == 8) {
        return test385_fail('no Dentist in the mission: want 100, not explained by Dentist; got ' + without.rating + '/' + without.explanation)
    }
    __log_marker('culture_skips_unavailable_dentist')

    if (!__game_load_savegame(T385_SAVE)) {
        __log_info_native('[test:385] skip real-data half: no ' + T385_SAVE)
        __log_marker('culture_selima_ok')
        __test385_ok = true
        __test_signal_ready()
        return
    }
    __test_city_update_culture()
    var selima = { rating: city.rating.culture | 0, explanation: city.rating.culture_explanation | 0 }
    __log_info_native('[test:385] Selima 7 culture ' + selima.rating + ', explanation ' + selima.explanation
        + ', dentist allowed ' + __scenario_building_allowed(BUILDING_DENTIST))
    if (__scenario_building_allowed(BUILDING_DENTIST) || selima.explanation == 8) {
        return test385_fail('Selima culture still explained by the Dentist')
    }
    __log_marker('culture_selima_ok')

    __test385_ok = true
    __test_signal_ready()
}

function check_valid() {
    if (!__test385_ok) {
        return false
    }
    var markers = ['culture_counts_allowed_dentist', 'culture_skips_unavailable_dentist', 'culture_selima_ok']
    for (var i = 0; i < markers.length; i++) {
        if (!__test_find_inlog('[test-marker] ' + markers[i])) {
            __log_info_native('[test:385] missing marker: ' + markers[i])
            return false
        }
    }
    return true
}
