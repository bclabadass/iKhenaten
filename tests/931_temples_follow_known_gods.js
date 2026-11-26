// A mission offers a temple and shrine to each god the city knows, and to no other (Brendan, 2026-11-25, Meidum:
// "In overseer of temples, I see Bast is patron and she has a temple complex, but for temples, I see Ra Osiris and
// Ptah"). The original gates temples by the map's known gods; Meidum's script offered Ra (unknown there) instead of
// its patron Bast, and Serabit Khadim's left out Ptah. Missions 0-4 unlock temples through their tutorials.
// A game already under way (the Duo's Meidum 1 save, when present) gets the same temples on load.
// Markers:
//   [test-marker] t931_temples_follow_gods

var T931_GODS = [
    ['Osiris', BUILDING_TEMPLE_OSIRIS, BUILDING_SHRINE_OSIRIS],
    ['Ra', BUILDING_TEMPLE_RA, BUILDING_SHRINE_RA],
    ['Ptah', BUILDING_TEMPLE_PTAH, BUILDING_SHRINE_PTAH],
    ['Seth', BUILDING_TEMPLE_SETH, BUILDING_SHRINE_SETH],
    ['Bast', BUILDING_TEMPLE_BAST, BUILDING_SHRINE_BAST],
]

function t931_mismatches(tag) {
    var bad = []
    for (var i = 0; i < T931_GODS.length; i++) {
        var known = !!city.gods.at(i).is_known
        for (var k = 1; k <= 2; k++) {
            if (!!__scenario_building_allowed(T931_GODS[i][k]) != known) {
                bad.push(tag + ' ' + T931_GODS[i][0] + (k == 1 ? ' temple' : ' shrine') + (known ? ' missing' : ' offered, god unknown'))
            }
        }
    }
    return bad
}

function run_test() {
    var bad = []
    for (var m = 5; m <= 52; m++) {
        __game_load_mission(m, 1)
        __test_pump_frames(1)
        bad = bad.concat(t931_mismatches('mission ' + m))
    }
    if (__game_load_savegame(__test_data_dir() + '/Save/DuoSaves/Meidum 1.svx')) {
        __test_pump_frames(1)
        bad = bad.concat(t931_mismatches('Meidum 1 save'))
    }
    __log_info_native('[test:931] temples against known gods, missions 5-52: ' + bad.length + ' mismatches ['
        + bad.join(' | ') + ']')
    if (bad.length == 0) {
        __log_marker('t931_temples_follow_gods')
    }
    test_reload_city_session('data/default.map')
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] t931_temples_follow_gods')
}
