// The recruiter trained a soldier every day at full staff (the generic walker timer, delay 0), and with no staff
// at all it still trained one every day (that timer's -1 let every day through). It now waits 8/12/16/32/48 days
// between recruits by staffing (100/75/50/25/1%), Caesar 3's barracks rule that it grew out of, and trains none
// without staff. Spawning runs once a day; here each __test_building_spawn_figure call is one day.
// Markers:
//   [test-marker] recruiter_pace_full_staff
//   [test-marker] recruiter_pace_by_staff
//   [test-marker] recruiter_idle_without_staff

// Soldiers created over `days` days with `workers` of the recruiter's 10.
function t336_recruits(rid, workers, days) {
    var made = 0
    for (var d = 0; d < days; d++) {
        __test_building_set_workers(rid, workers)
        var before = __test_count_figures(FIGURE_ARCHER)
        __test_building_spawn_figure(rid)
        made += __test_count_figures(FIGURE_ARCHER) - before
    }
    return made
}

function run_test() {
    test_reload_city_session('data/default.map')
    __test_set_treasury(100000)
    var allow = [BUILDING_RECRUITER, BUILDING_FORT_ARCHERS, BUILDING_FORT_GROUND]
    for (var a = 0; a < allow.length; a++) {
        __scenario_building_allow(allow[a], true)
    }
    var rid = test_building_place(BUILDING_RECRUITER, -1, -1)
    var fort = test_building_place(BUILDING_FORT_ARCHERS, -1, -1)
    test_planner_exit_build_mode()
    if (!rid || !fort) {
        __log_info_native('[test:336] place failed r=' + rid + ' fort=' + fort)
        __test_signal_ready()
        return
    }
    __test_fort_update_recruit_status(fort)
    __test_building_set_houses_covered(rid, 100)

    city.get_building(rid).figure_spawn_delay = 0
    var full = t336_recruits(rid, 10, 27)
    city.get_building(rid).figure_spawn_delay = 0
    var half = t336_recruits(rid, 5, 34)
    city.get_building(rid).figure_spawn_delay = 0
    var none = t336_recruits(rid, 0, 20)
    __log_info_native('[test:336] recruits: full staff ' + full + ' in 27 days, half staff ' + half + ' in 34 days, no staff ' + none + ' in 20 days')

    if (full == 3) {
        __log_marker('recruiter_pace_full_staff')
    }
    if (half == 2) {
        __log_marker('recruiter_pace_by_staff')
    }
    if (none == 0) {
        __log_marker('recruiter_idle_without_staff')
    }
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] recruiter_pace_full_staff')
        && __test_find_inlog('[test-marker] recruiter_pace_by_staff')
        && __test_find_inlog('[test-marker] recruiter_idle_without_staff')
}
