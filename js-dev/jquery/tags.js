"use strict";

var tag_weight = {};
tag_weight[0]   = 'i_rate_';
tag_weight[100] = 'i_rate_halfstar';
tag_weight[200] = 'i_rate_verylow';
tag_weight[300] = 'i_rate_low';
tag_weight[400] = 'i_rate_med';
tag_weight[500] = 'i_rate_high';
tag_weight[600] = 'i_rate_veryhigh';

var tag_weight_rev = {};
tag_weight_rev['i_rate_']         = 0;
tag_weight_rev['i_rate_halfstar'] = 100;
tag_weight_rev['i_rate_verylow']  = 200;
tag_weight_rev['i_rate_low']      = 300;
tag_weight_rev['i_rate_med']      = 400;
tag_weight_rev['i_rate_high']     = 500;
tag_weight_rev['i_rate_veryhigh'] = 600;

function toggle_tag(tag, weight, is_parent) {
	var parent   = $('#tag-list div.tag#' + $(tag).attr('parentid'));
	if ($(tag).hasClass('is_abstract')) {
		if (parent.attr('id')) {
			toggle_tag(parent, weight, 1);
		}
		return;
	}

	var state = $('span.state span.i_icon', tag);
	if ($(tag).hasClass('has_weight')) {
		var icon  = $('span.weight span.i_icon', tag);
		for (var cls in tag_weight_rev) {
			if ($(icon).hasClass(cls)) {
				var cur_weight = (tag_weight_rev[cls] || 0);
				var old_weight = $('span.weight', tag).attr('value');
				if (weight === undefined) {
					weight = cur_weight + 100;
					if (!tag_weight[weight]) {
						weight = 0;
					}
				}

				var min_weight = get_max_weight_of_childs($(tag).attr('id'));
				if (is_parent && old_weight && old_weight >= min_weight && cur_weight==600 && weight < cur_weight) {
					weight = old_weight;
				} else if (is_parent && cur_weight==600 && weight < cur_weight) {
					weight = min_weight;
				} else if (is_parent && weight < cur_weight) {
					weight = cur_weight;
				} else if (weight < min_weight) {
					weight = min_weight;
				}

				if (cur_weight == weight) {
					break;
				}

				var cls_new    = tag_weight[weight];
				$(icon).removeClass(cls);
				$(icon).addClass(cls_new);
				set_input_value($(tag).attr('id'), weight, $(tag).attr('tagentityrelid'));

				if ($(tag).hasClass('added')) {
					if (cls_new == 'i_rate_') {
						$(tag).addClass('delete');
						$(state).addClass('i_general_delete');
						$(tag).removeClass('added');
						$(state).removeClass('i_general_added');
						$(state).removeClass('i_general_edit');
						$(state).attr('title', 'to be deleted');
					} else if (old_weight != weight) {
						$(state).addClass('i_general_edit');
						$(state).removeClass('i_general_added');
						$(state).attr('title', 'weight was edited');
					} else {
						$(state).addClass('i_general_added');
						$(state).removeClass('i_general_edit');
						$(state).attr('title', 'was added previously with the same weight');
					}
				} else if ($(tag).hasClass('delete')) {
					if (old_weight != weight) {
						$(tag).addClass('added');
						$(state).addClass('i_general_edit');
						$(tag).removeClass('delete');
						$(state).removeClass('i_general_delete');
						$(state).attr('title', 'weight was edited');
					}
					else {
						$(tag).addClass('added');
						$(state).addClass('i_general_added');
						$(tag).removeClass('delete');
						$(state).removeClass('i_general_delete');
						$(state).attr('title', 'was added previously with the same weight');
					}
				} else if ($(state).hasClass('i_general_new')) {
					if (cls_new == 'i_rate_') {
						$(state).removeClass('i_general_new');
					}
				} else {
					$(state).addClass('i_general_new');
					$(state).attr('title', 'to be added');
				}

				break;
			}
		}
	} else if ($(tag).hasClass('added')) {
		$(tag).addClass('delete');
		$(state).addClass('i_general_delete');
		$(tag).removeClass('added');
		$(state).removeClass('i_general_added');
		$(state).attr('title', 'to be deleted');
		set_input_value($(tag).attr('id'), 0, $(tag).attr('tagentityrelid'));
	} else if ($(tag).hasClass('delete')) {
		$(tag).addClass('added');
		$(state).addClass('i_general_added');
		$(tag).removeClass('delete');
		$(state).removeClass('i_general_delete');
		$(state).attr('title', 'was added previously');
		set_input_value($(tag).attr('id'), null, $(tag).attr('tagentityrelid'));
	} else if ($(state).hasClass('i_general_new')) {
		$(state).removeClass('i_general_new');
		set_input_value($(tag).attr('id'), 0, $(tag).attr('tagentityrelid'));
	} else {
		$(state).addClass('i_general_new');
		$(state).attr('title', 'to be added');
		set_input_value($(tag).attr('id'), null, $(tag).attr('tagentityrelid'));
	}

	if (parent.attr('id')) {
		toggle_tag(parent, weight, 1);
	}
}

function set_input_value (tagid, weight, tagentityrelid) {
	var input = $('#tag-fieldset input#data' + tagid);
	if (tagentityrelid == undefined && weight == 0) {
		//useless entry
		$(input).remove();
		return;
	}

	if (weight == undefined) {
		//tag without weight
		weight = 'none';
	} else if (weight == 0) {
		//delete tag
		weight = 'delete';
	}

	if (tagentityrelid == undefined) {
		tagentityrelid = '';
	}

	if (input.attr('id')) {
		//edit existing entry
		$(input).attr('value', weight + "-" + tagentityrelid);
	} else {
		//new entry to be added
		$('#tag-fieldset').append('<input type="hidden" id="data' + tagid + '" name="data.' + tagid + '" value="' + weight + '-' + tagentityrelid + '" />')
	}
}

function get_max_weight_of_childs (parentid) {
	var weights = $('#tag-list div.tag[parentid=' + parentid + ']').map( function() {
		for (var cls in tag_weight_rev) {
			if ($('span.weight span.i_icon', this).hasClass(cls)) {
				if (tag_weight_rev[cls] > 0) {
					return tag_weight_rev[cls];
				}
				break;
			}
		}
		return 0;
	}).get();

	return Math.max.apply(Math, weights);
}

function toggle_group(group) {
	if ($(group).hasClass('unset')) {
		$(group).removeClass('unset');
		$('#tag-list div.tag-column[groupid="' + $(group).attr("groupid") + '"]').removeClass('hide');
	} else {
		$(group).addClass('unset');
		$('#tag-list div.tag-column[groupid="' + $(group).attr("groupid") + '"]').addClass('hide');
	}
}

$(document).ready(function() {
	$("#tag-list div.tag").not('div.tag.is_abstract').click(function() {toggle_tag(this)});
	$("#tag-groups span.link").click(function() {toggle_group(this)});
});