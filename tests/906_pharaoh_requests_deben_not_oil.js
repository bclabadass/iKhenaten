// The original campaign's data names deben in a request or gift as item 31, the number this engine uses for oil:
// on Saqqara the Pharaoh asked for 511 oil (shown as 51100), which the base campaign doesn't even have (Brendan).
// In the base campaign (missions before 38) item 31 always comes with sums of money (Timna 885, Saqqara 500-800,
// South Dahshur up to 8000); the Cleopatra missions use it for oil in loads (4-9). Those requests are deben now.
// Markers:
//   [test-marker] t906_saqqara_asks_deben

function run_test() {
    __game_load_mission(10, 1)
    __test_pump_frames(3)
    mission.pharaoh_requested_oil = false
    mission10_pharaoh_request_oil({ years_since_start: 4, month: 10 })
    __test_events_dump()
    if (__test_find_inlog('item=' + RESOURCE_DEBEN + ',0,0,0 amount=501,')) {
        __log_marker('t906_saqqara_asks_deben')
    }
    __log_info_native('[test:906] RESOURCE_DEBEN ' + RESOURCE_DEBEN + ', RESOURCE_OIL ' + RESOURCE_OIL)
    test_reload_city_session('data/default.map')
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] t906_saqqara_asks_deben')
}
