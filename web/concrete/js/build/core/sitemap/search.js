/**
 * block ajax
 */

!function(global, $) {
	'use strict';

	function ConcretePageAjaxSearch($element, options) {
		'use strict';
		var my = this;
		options = $.extend({
			'mode': 'menu',
		}, options);

		my.options = options;

		my._templateSearchResultsMenu = _.template(ConcretePageAjaxSearchMenu.get());
		ConcreteAjaxSearch.call(my, $element, options);

		my.setupEvents();

    }

	ConcretePageAjaxSearch.prototype = Object.create(ConcreteAjaxSearch.prototype);

	ConcretePageAjaxSearch.prototype.setupEvents = function() {
		var my = this;
		ConcreteEvent.subscribe('SitemapDeleteRequestComplete', function(e) {
			my.refreshResults();
		});
	};

	ConcretePageAjaxSearch.prototype.updateResults = function(result) {
		var my = this, $e = my.$element;
		ConcreteAjaxSearch.prototype.updateResults.call(my, result);
		if (my.options.mode == 'choose') {
			// hide the checkbox since they're pointless here.
			$e.find('.ccm-search-results-checkbox').parent().remove();
			// hide the bulk item selector.
			$e.find('select[data-bulk-action]').parent().remove();

			$e.unbind('.concretePageSearchHoverPage');
			$e.on('mouseover.concretePageSearchHoverPage', 'tr[data-launch-search-menu]', function() {
				$(this).addClass('ccm-search-select-hover');
			});
			$e.on('mouseout.concretePageSearchHoverPage', 'tr[data-launch-search-menu]', function() {
				$(this).removeClass('ccm-search-select-hover');
			});
			$e.unbind('.concretePageSearchChoosePage').on('click.concretePageSearchChoosePage', 'tr[data-launch-search-menu]', function() {
				ConcreteEvent.publish('SitemapSelectPage', {cID: $(this).attr('data-page-id'), title: $(this).attr('data-page-name')});
				return false;
			});
		}
	}

	ConcretePageAjaxSearch.prototype.handleSelectedBulkAction = function(value, type, $option, $items) {
		if (value == 'movecopy') {
			var url, my = this, itemIDs = [];
			$.each($items, function(i, checkbox) {
				itemIDs.push($(checkbox).val());
			});

			ConcreteEvent.subscribe('SitemapSelectPage', function(e, data) {
				url = CCM_TOOLS_PATH + '/dashboard/sitemap_drag_request?origCID=' + itemIDs.join(',') + '&destCID=' + data.cID;
				$.fn.dialog.open({
					width: 350,
					height: 350,
					href: url,
					title: ccmi18n_sitemap.moveCopyPage
				});
			});
		} else {
			ConcreteAjaxSearch.prototype.handleSelectedBulkAction.call(this, value, type, $option, $items);
		}
	}

	ConcreteAjaxSearch.prototype.createMenu = function($selector) {
		var my = this;
		$selector.concretePageMenu({
			'container': my,
			'menu': $('[data-search-menu=' + $selector.attr('data-launch-search-menu') + ']')
		});
	}

	var ConcretePageAjaxSearchMenu = {

		get: function() {
			return '<div class="ccm-popover-page-menu popover fade" data-search-page-menu="<%=item.cID%>" data-search-menu="<%=item.cID%>">' +
				'<div class="arrow"></div><div class="popover-inner"><ul class="dropdown-menu">' + 
				'<% if (item.isTrash) { %>' + 
					'<li><a data-action="empty-trash" href="javascript:void(0)">' + ccmi18n_sitemap.emptyTrash + '</a></li>' + 
				'<% } else if (item.isInTrash) { %>' + 
					'<li><a onclick="ccm_previewInternalTheme(<%=item.cID%>, false, \'' + ccmi18n_sitemap.previewPage + '\')" href="javascript:void(0)">' + ccmi18n_sitemap.previewPage + '</a></li>' +
					'<li class="divider"><\/li>' + 
					'<li><a data-action="delete-forever" href="javascript:void(0)">' + ccmi18n_sitemap.deletePageForever + '</a></li>' +
				'<% } else if (item.cAlias == \'LINK\' || item.cAlias == \'POINTER\') { %>' +
					'<li><a onclick="window.location.href=\'' + CCM_DISPATCHER_FILENAME + '?cID=<%=item.cID%>\'" href="javascript:void(0)">' + ccmi18n_sitemap.visitExternalLink + '</a></li>' +
					'<% if (item.cAlias == \'LINK\' && item.canEditProperties) { %>' +
						'<li><a dialog-width="350" dialog-height="170" dialog-title="' + ccmi18n_sitemap.editExternalLink + '" dialog-modal="false" dialog-append-buttons="true" href="' + CCM_TOOLS_PATH + '/edit_collection_popup?rel=SITEMAP&cID=<%=item.cID%>&ctask=edit_external">' + ccmi18n_sitemap.editExternalLink + '</a></li>' +
					'<% } %>' +
					'<% if (item.canDelete) { %>' +
						'<li><a dialog-width="360" dialog-height="150" dialog-modal="false" dialog-title="' + ccmi18n_sitemap.deleteExternalLink + '" href="' + CCM_TOOLS_PATH + '/edit_collection_popup?rel=SITEMAP&cID=<%=item.cID%>&ctask=delete_external">' + ccmi18n_sitemap.deleteExternalLink + '</a></li>' +
					'<% } %>' +
				'<% } else { %>' + 
					'<li><a href="#" data-action="visit">' + ccmi18n_sitemap.visitPage + '</a></li>' +
					'<% if (item.canEditPageProperties || item.canEditPageSpeedSettings || item.canEditPagePermissions || item.canEditPageDesign || item.canViewPageVersions || item.canDeletePage) { %>' + 
						'<li class="divider"></li>' + 
					'<% } %>' +
					'<% if (item.canEditPageProperties) { %>' + 
						'<li><a class="dialog-launch" dialog-on-close="ConcreteSitemap.exitEditMode(<%=item.cID%>)" dialog-width="640" dialog-height="360" dialog-modal="false" dialog-title="' + ccmi18n_sitemap.seo + '" href="' + CCM_DISPATCHER_FILENAME + '/ccm/system/panels/details/page/seo?cID=<%=item.cID%>">' + ccmi18n_sitemap.seo + '</a></li>' + 
						'<% if (item.cID > 1) { %>' + 
							'<li><a class="dialog-launch" dialog-on-close="ConcreteSitemap.exitEditMode(<%=item.cID%>)" dialog-width="500" dialog-height="500" dialog-modal="false" dialog-title="' + ccmi18n_sitemap.pageLocationTitle + '" href="' + CCM_DISPATCHER_FILENAME + '/ccm/system/panels/details/page/location?cID=<%=item.cID%>">' + ccmi18n_sitemap.pageLocation + '</a></li>' + 
						'<% } %>' + 
						'<li class="divider"></li>' + 
						'<li><a class="dialog-launch" dialog-on-close="ConcreteSitemap.exitEditMode(<%=item.cID%>)" dialog-width="90%" dialog-height="70%" dialog-modal="false" dialog-title="' + ccmi18n_sitemap.pageAttributesTitle + '" href="' + CCM_DISPATCHER_FILENAME + '/ccm/system/dialogs/page/attributes?cID=<%=item.cID%>">' + ccmi18n_sitemap.pageAttributes + '</a></li>' + 
					'<% } %>' +
					'<% if (item.canEditPageSpeedSettings) { %>' + 
						'<li><a class="dialog-launch" dialog-on-close="ConcreteSitemap.exitEditMode(<%=item.cID%>)" dialog-width="550" dialog-height="280" dialog-modal="false" dialog-title="' + ccmi18n_sitemap.speedSettingsTitle + '" href="' + CCM_DISPATCHER_FILENAME + '/ccm/system/panels/details/page/caching?cID=<%=item.cID%>">' + ccmi18n_sitemap.speedSettings + '</a></li>' + 
					'<% } %>' +
					'<% if (item.canEditPagePermissions) { %>' + 
						'<li><a class="dialog-launch" dialog-on-close="ConcreteSitemap.exitEditMode(<%=item.cID%>)" dialog-width="500" dialog-height="630" dialog-modal="false" dialog-title="' + ccmi18n_sitemap.setPagePermissions + '" href="' + CCM_DISPATCHER_FILENAME + '/ccm/system/panels/details/page/permissions?cID=<%=item.cID%>">' + ccmi18n_sitemap.setPagePermissions + '</a></li>' + 
					'<% } %>' +
					'<% if (item.canEditPageDesign) { %>' + 
						'<li><a class="dialog-launch" dialog-on-close="ConcreteSitemap.exitEditMode(<%=item.cID%>)" dialog-width="350" dialog-height="250" dialog-modal="false" dialog-title="' + ccmi18n_sitemap.pageDesign + '" href="' + CCM_DISPATCHER_FILENAME + '/ccm/system/dialogs/page/design?cID=<%=item.cID%>">' + ccmi18n_sitemap.pageDesign + '</a></li>' + 
					'<% } %>' +
					'<% if (item.canViewPageVersions) { %>' + 
						'<li><a class="dialog-launch" dialog-on-close="ConcreteSitemap.exitEditMode(<%=item.cID%>)" dialog-width="640" dialog-height="340" dialog-modal="false" dialog-title="' + ccmi18n_sitemap.pageVersions + '" href="' + CCM_DISPATCHER_FILENAME + '/ccm/system/panels/page/versions?cID=<%=item.cID%>">' + ccmi18n_sitemap.pageVersions + '</a></li>' + 
					'<% } %>' +
					'<% if (item.canDeletePage) { %>' + 
						'<li><a class="dialog-launch" dialog-on-close="ConcreteSitemap.exitEditMode(<%=item.cID%>)" dialog-width="360" dialog-height="250" dialog-modal="false" dialog-title="' + ccmi18n_sitemap.deletePage + '" href="' + CCM_DISPATCHER_FILENAME + '/ccm/system/dialogs/page/delete?cID=<%=item.cID%>">' + ccmi18n_sitemap.deletePage + '</a></li>' + 
					'<% } %>' +
					'<li class="divider" data-sitemap-mode="explore"></li>' + 
					'<li data-sitemap-mode="explore"><a class="dialog-launch" dialog-width="90%" dialog-height="70%" dialog-modal="false" dialog-title="' + ccmi18n_sitemap.moveCopyPage + '" href="' + CCM_TOOLS_PATH + '/sitemap_search_selector?sitemap_select_mode=move_copy_delete&cID=<%=item.cID%>">' + ccmi18n_sitemap.moveCopyPage + '</a></li>' +
					'<li data-sitemap-mode="explore"><a href="' + CCM_DISPATCHER_FILENAME + '/dashboard/sitemap/explore?cNodeID=<%=item.cID%>&task=send_to_top">' + ccmi18n_sitemap.sendToTop + '</a></li>' +
					'<li data-sitemap-mode="explore"><a href="' + CCM_DISPATCHER_FILENAME + '/dashboard/sitemap/explore?cNodeID=<%=item.cID%>&task=send_to_bottom">' + ccmi18n_sitemap.sendToBottom + '</a></li>' +
					'<% if (item.numSubpages > 0) { %>' + 
						'<li class="divider"></li>' + 
						'<li><a href="' + CCM_DISPATCHER_FILENAME + '/dashboard/sitemap/search/?selectedSearchField[]=parent&cParentAll=1&cParentIDSearchField=<%=item.cID%>">' + ccmi18n_sitemap.searchPages + '</a></li>' +
						'<li><a href="' + CCM_DISPATCHER_FILENAME + '/dashboard/sitemap/explore/-/<%=item.cID%>">' + ccmi18n_sitemap.explorePages + '</a></li>' +
					'<% } %>' +
					//'<% if (item.canAddExternalLinks) { %>' + 
					//	'<li class="divider"></li>' + 
					//	'<li><a class="dialog-launch" dialog-width="350" dialog-modal="false" dialog-height="260" dialog-title="' + ccmi18n_sitemap.addExternalLink + '" dialog-modal="false" href="' + CCM_TOOLS_PATH + '/edit_collection_popup?rel=SITEMAP&cID=<%=item.cID%>&ctask=add_external">' + ccmi18n_sitemap.addExternalLink + '</a></li>' +
					//'<% } %>' +
				'<% } %>' +
		'</ul></div></div>';
		}
	}



	// jQuery Plugin
	$.fn.concretePageAjaxSearch = function(options) {
		return $.each($(this), function(i, obj) {
			new ConcretePageAjaxSearch($(this), options);
		});
	}

	global.ConcretePageAjaxSearch = ConcretePageAjaxSearch;
	global.ConcretePageAjaxSearchMenu = ConcretePageAjaxSearchMenu;

}(this, $);
