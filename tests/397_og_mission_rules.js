// The mission scripts' building lists drifted from the original campaign (Brendan on the Duo: Fort: Charioteers on
// Selima; a Seth temple complex, whose god isn't one of Saqqara's, and a small mastaba on Saqqara, where the briefing
// names only the medium stepped pyramid). The original's per-mission rules, decoded from mission1.pak by
// tools/og_mission_rules.py into scripts/mission_og_rules.js, now apply when a mission loads: buildings the editor
// turned off stay off (from Timna on), the temple complexes are the original's, and only the briefing's monuments
// are offered.
// Markers:
//   [test-marker] og_rules_table_loaded
//   [test-marker] og_rules_selima
//   [test-marker] og_rules_abu
//   [test-marker] og_rules_saqqara

var __test397_ok = false

function t397_fail(msg) {
    __log_info_native('[test:397] FAIL ' + msg)
    __test_signal_ready()
}

// want: { type: allowed }
function t397_check(mission, want, marker) {
    __game_load_mission(mission, 1)
    __test_pump_frames(3)
    var wrong = []
    for (var key in want) {
        var got = !!__scenario_building_allowed(want[key][0])
        if (got != want[key][1]) {
            wrong.push(key + ' ' + got)
        }
    }
    __log_info_native('[test:397] mission ' + mission + ' wrong: ' + JSON.stringify(wrong))
    if (wrong.length) {
        return false
    }
    __log_marker(marker)
    return true
}

function run_test() {
    __log_info_native('[test:397] original mission rules')
    if (og_mission_rules.missions.length < 40) {
        return t397_fail('rules table has ' + og_mission_rules.missions.length + ' missions')
    }
    __log_marker('og_rules_table_loaded')

    if (!t397_check(8, {
        fort_charioteers: [BUILDING_FORT_CHARIOTEERS, false], fort_infantry: [BUILDING_FORT_INFANTRY, true],
        recruiter: [BUILDING_RECRUITER, true], complex_seth: [BUILDING_TEMPLE_COMPLEX_SETH, true],
        altar_anubis: [BUILDING_TEMPLE_COMPLEX_ALTAR_ANUBIS, true], complex_ptah: [BUILDING_TEMPLE_COMPLEX_PTAH, false]
    }, 'og_rules_selima')) {
        return t397_fail('Selima')
    }
    if (!t397_check(9, {
        complex_ptah: [BUILDING_TEMPLE_COMPLEX_PTAH, true], complex_osiris: [BUILDING_TEMPLE_COMPLEX_OSIRIS, false],
        water_lift: [BUILDING_WATER_LIFT, false]
    }, 'og_rules_abu')) {
        return t397_fail('Abu')
    }
    if (!t397_check(10, {
        small_mastaba: [BUILDING_SMALL_MASTABA, false], medium_stepped: [BUILDING_MEDIUM_STEPPED_PYRAMID, true],
        complex_seth: [BUILDING_TEMPLE_COMPLEX_SETH, false], complex_ptah: [BUILDING_TEMPLE_COMPLEX_PTAH, true],
        recruiter: [BUILDING_RECRUITER, false], fort_charioteers: [BUILDING_FORT_CHARIOTEERS, false]
    }, 'og_rules_saqqara')) {
        return t397_fail('Saqqara')
    }

    __test397_ok = true
    __test_signal_ready()
}

function check_valid() {
    if (!__test397_ok) {
        return false
    }
    var markers = ['og_rules_table_loaded', 'og_rules_selima', 'og_rules_abu', 'og_rules_saqqara']
    for (var i = 0; i < markers.length; i++) {
        if (!__test_find_inlog('[test-marker] ' + markers[i])) {
            return false
        }
    }
    return true
}
