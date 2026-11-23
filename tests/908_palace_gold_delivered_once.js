// A cart of gold delivered to the palace adds its load to the treasury, and the palace counts the gold it took in a
// 16-bit store. Once that store reached 65535 it could take no more, so the cart counted the delivery as failed and
// came back with the same load, while the treasury had already been paid: each cart paid out again every few days
// (Brendan, Saqqara: money rising steadily, 40792 deben of gold in three months). The store is emptied when it can't
// take a load (nothing reads it; the vault shown is the tax money).
// Needs the Duo save in the Pharaoh folder's Save/DuoSaves/; without it the test logs a skip and passes.
// Markers:
//   [test-marker] t908_each_cart_pays_once
//   [test-marker] t908_save_skipped

function run_test() {
    if (!__game_load_savegame(__test_data_dir() + '/Save/DuoSaves/Saqqara money.svx')) {
        __log_marker('t908_save_skipped')
        __test_signal_ready()
        return
    }
    __test_pump_frames(2)
    var orig = building_palace_add_resource
    var by_cart = {}
    var most = 0
    building_palace_add_resource = function(ev) {
        if (ev.resource == RESOURCE_GOLD) {
            by_cart[ev.fid] = (by_cart[ev.fid] || 0) + 1
            most = Math.max(most, by_cart[ev.fid])
        }
        return orig(ev)
    }
    var t0 = city.finance.treasury
    __test_pump_frames(1200)
    building_palace_add_resource = orig
    __log_info_native('[test:908] 15 days: gold deliveries by cart ' + JSON.stringify(by_cart) + ', treasury +'
        + (city.finance.treasury - t0))
    if (most <= 1) {
        __log_marker('t908_each_cart_pays_once')
    }
    test_reload_city_session('data/default.map')
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] t908_each_cart_pays_once') || __test_find_inlog('[test-marker] t908_save_skipped')
}
