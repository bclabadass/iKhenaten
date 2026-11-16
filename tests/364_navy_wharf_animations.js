// The transport and warship wharves animate their own dock worker in every facing. The facings were copied from
// other water buildings: the south one used the trade dock's dockers (SprAmbient 56), the east one the fishing
// wharf's crew (46) placed off the wharf, in the water or the air, and the warship wharf had no north animation at
// all. All four now use the wharf's worker (47, one facing, 24 images, one image a frame), with east placed on the
// deck, and the waiting worker's east place too. Also, the animation is picked by the facing on the map, but only
// at the daily update, so after a camera turn the wharf drew one facing's animation at another facing's place until
// the next day; a turn now picks it again.
// Markers:
//   [test-marker] wharf_facings_use_the_worker
//   [test-marker] wharf_animation_follows_turn (with the game's images) or wharf_turn_check_skipped_no_images

var T364_WHARVES = [
    { name: 'transport', cfg: building_transport_wharf },
    { name: 'warship', cfg: building_warship_wharf },
]

function t364_check_config() {
    var wrong = []
    for (var w = 0; w < T364_WHARVES.length; w++) {
        var anims = T364_WHARVES[w].cfg.animations
        var facings = ['n', 'w', 's', 'e']
        for (var f = 0; f < facings.length; f++) {
            var a = anims['work_' + facings[f]]
            if (!a || a.pack != PACK_SPR_AMBIENT || a.id != 47 || a.frame_step != 1 || a.max_frames > 24) {
                wrong.push(T364_WHARVES[w].name + ' work_' + facings[f] + ' ' + JSON.stringify(a))
            }
        }
    }
    __log_info_native('[test:364] wharf facings not using the worker: ' + JSON.stringify(wrong))
    if (wrong.length == 0) {
        __log_marker('wharf_facings_use_the_worker')
    }
}

function t364_check_turn() {
    test_reload_city_session('data/default.map')
    __scenario_building_allow(BUILDING_TRANSPORT_WHARF, true)
    var wharf = test_shoreline_building_place(BUILDING_TRANSPORT_WHARF, 2)
    var b = wharf ? city.get_building(wharf) : null
    var base = b ? b.params.first_img('base') : -1
    if (!b || base <= 0) {
        __log_info_native('[test:364] no wharf images (wharf ' + wharf + ', base ' + base + '): turn check skipped')
        __log_marker('wharf_turn_check_skipped_no_images')
        return
    }
    __test_building_set_workers(wharf, 20)
    var mismatched = []
    for (var r = 0; r < 4; r++) {
        building_wharf_set_orient_animation(b, 'wait')
        __camera_rotate_right()
        __test_pump_frames(1)
        var want = 'wait' + building_wharf_orient_suffix(__map_image_at(b.tile), base)
        var got = __test_building_anim_key(wharf)
        if (got != want && got != '') {
            mismatched.push(r + ':' + got + '/' + want)
        }
    }
    __camera_rotate_north()
    __log_info_native('[test:364] after camera turns, animation / facing: ' + JSON.stringify(mismatched))
    if (mismatched.length == 0) {
        __log_marker('wharf_animation_follows_turn')
    }
}

function run_test() {
    t364_check_config()
    t364_check_turn()
    test_reload_city_session('data/default.map')
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] wharf_facings_use_the_worker')
        && (__test_find_inlog('[test-marker] wharf_animation_follows_turn')
            || __test_find_inlog('[test-marker] wharf_turn_check_skipped_no_images'))
}
