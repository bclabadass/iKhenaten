// Buildings draw the goods they hold with their own pile pictures. The piles are General groups 198-210, one per
// good (frames from the storage yard sheet): 198 beer, 199 linen, 200 gems, 201 weapons (cowhide shields), 202 timber,
// 203 copper, 204 straw, 205 game meat, 206 reeds (frames 0-4) and papyrus (5-7), 207 clay, 208 barley, 210 flax;
// matched to the game's own resource icons. Several named the wrong group: weaver flax, chariot maker timber,
// cattle ranch / brickworks / zoo straw all showed reeds; the chariot maker's weapons, the scribal school's papyrus
// showed clay; the clay pit showed barley; the gemstone mine copper; and the brewery's pile (barley) was keyed to
// beer, which a brewery never holds, so it never showed.
// Markers:
//   [test-marker] stock_pictures_match_goods

var T343_CASES = [
    { type: BUILDING_WEAVER_WORKSHOP, res: RESOURCE_FLAX, group: 210, offset: 0, frames: 2 },
    { type: BUILDING_CHARIOTS_WORKSHOP, res: RESOURCE_TIMBER, group: 202, offset: 0, frames: 5 },
    { type: BUILDING_CHARIOTS_WORKSHOP, res: RESOURCE_WEAPONS, group: 201, offset: 0, frames: 2 },
    { type: BUILDING_CATTLE_RANCH, res: RESOURCE_STRAW, group: 204, offset: 0, frames: 2 },
    { type: BUILDING_BRICKS_WORKSHOP, res: RESOURCE_STRAW, group: 204, offset: 0, frames: 2 },
    { type: BUILDING_ZOO, res: RESOURCE_STRAW, group: 204, offset: 0, frames: 2 },
    { type: BUILDING_SCRIBAL_SCHOOL, res: RESOURCE_PAPYRUS, group: 206, offset: 5, frames: 3 },
    { type: BUILDING_CLAY_PIT, res: RESOURCE_CLAY, group: 207, offset: 0, frames: 2 },
    { type: BUILDING_GEMSTONE_MINE, res: RESOURCE_GEMS, group: 200, offset: 0, frames: 2 },
    { type: BUILDING_BREWERY_WORKSHOP, res: RESOURCE_BARLEY, group: 208, offset: 0, frames: 2 },
    { type: BUILDING_MORTUARY, res: RESOURCE_LINEN, group: 199, offset: 0, frames: 5 }
]

function run_test() {
    test_reload_city_session('data/default.map')
    var wrong = []
    for (var i = 0; i < T343_CASES.length; i++) {
        var c = T343_CASES[i]
        var bid = __test_building_create(c.type, 20 + (i % 4) * 8, 20 + ((i / 4) | 0) * 8)
        var b = bid ? city.get_building(bid) : null
        if (!b) {
            wrong.push(c.type + ':no building')
            continue
        }
        b.store_resource(c.res, 200)
        var got = __test_building_overlay_image(bid, c.res)
        var img = got ? parseInt(got.split(',')[0]) : 0
        var copies = got ? parseInt(got.split(',')[1]) : 0
        var first = __test_image_from_desc(PACK_GENERAL, c.group, c.offset)
        var ok = copies > 0 && img >= first && img < first + c.frames
        __log_info_native('[test:343] building ' + c.type + ' holding resource ' + c.res + ': picture '
            + (got ? (img - __test_image_from_desc(PACK_GENERAL, c.group, 0)) + ' of group ' + c.group + ' x' + copies : 'none')
            + (ok ? '' : ' (want group ' + c.group + ' frames ' + c.offset + '-' + (c.offset + c.frames - 1) + ')'))
        if (!ok) {
            wrong.push(c.type + '/' + c.res)
        }
    }
    __log_info_native('[test:343] wrong: ' + JSON.stringify(wrong))
    // Without the game's images (CI) the pictures can't be told apart.
    if (__test_image_from_desc(PACK_GENERAL, 198, 0) <= 0) {
        __log_marker('stock_pictures_skipped_no_images')
    } else if (wrong.length == 0) {
        __log_marker('stock_pictures_match_goods')
    }
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] stock_pictures_match_goods')
        || __test_find_inlog('[test-marker] stock_pictures_skipped_no_images')
}
