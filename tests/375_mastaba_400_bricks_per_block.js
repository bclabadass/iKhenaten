// A laborer's sled carries one block of 400 bricks from the storage yard (figure_worker load: 400), and that
// is what a mastaba block costs (Brendan, from the original). The mastabas' phase lists counted 100 bricks per
// block, so the panel showed a quarter of what was really used and "import as needed" bought a quarter of it.
// Every brick phase of the small, medium and large mastaba now asks for blocks x 400.

var __test375_ok = false

function test375_fail(msg) {
    __log_info_native('[test:375] ' + msg)
    __test375_ok = false
    __test_signal_ready()
}

function run_test() {
    __log_info_native('[test:375] mastaba bricks per block')
    test_reload_city_session('data/default.map')
    __test_set_treasury(5000000)

    var load = 0

    var kinds = [['small', BUILDING_SMALL_MASTABA], ['medium', BUILDING_MEDIUM_MASTABA], ['large', BUILDING_LARGE_MASTABA]]
    var spots = [{x: 30, y: 30}, {x: 60, y: 30}, {x: 30, y: 70}, {x: 90, y: 90}, {x: 60, y: 70}, {x: 100, y: 40}]
    var summary = ''
    for (var k = 0; k < kinds.length; ++k) {
        __scenario_building_allow(kinds[k][1], true)
        var bid = 0
        for (var s = 0; s < spots.length && !bid; ++s) {
            bid = test_building_place(kinds[k][1], spots[s].x, spots[s].y)
        }
        if (!bid) {
            return test375_fail(kinds[k][0] + ' mastaba not placed')
        }
        var phases = 0
        for (var ph = 0; ph < 12; ++ph) {
            var parts = __test_monument_phase_bricks(bid, ph).split(',')
            var blocks = parseInt(parts[0]), bricks = parseInt(parts[1]), per = parseInt(parts[2])
            load = parseInt(parts[3])
            if (load != 400) {
                return test375_fail('laborer load ' + load + ', want 400')
            }
            if (!(blocks > 0)) {
                continue
            }
            phases++
            if (bricks != blocks * load || per != load) {
                return test375_fail(kinds[k][0] + ' phase ' + ph + ': ' + blocks + ' blocks need ' + bricks + ' bricks (' + per + ' per block), want ' + (blocks * load))
            }
        }
        if (!phases) {
            return test375_fail(kinds[k][0] + ': no brick phases found')
        }
        summary += ' ' + kinds[k][0] + ' ' + phases + ' phases ok'
    }
    __log_info_native('[test:375]' + summary)
    __test375_ok = true
    __test_signal_ready()
}

function check_valid() {
    return __test375_ok
}
