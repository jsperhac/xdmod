Ext.namespace('XDMoD.Module.Dashboard');

XDMoD.Module.Dashboard.SavedChartsReportsComponent = Ext.extend(CCR.xdmod.ui.Portlet, {

    layout: 'fit',
    autoScroll: true,
    title: 'Saved Charts and Reports',
    width: 1000,

    initComponent: function () {
        var aspectRatio = 11 / 17;

        this.help = {
            title: this.title,
            html: '<img src="/gui/images/help/chartsreports-component.svg" />'
        };

        this.chartReportStore = new Ext.data.JsonStore({
            // store configs
            autoDestroy: true,
            url: XDMoD.REST.url + '/dashboard/savedchartsreports',
            // reader configs
            root: 'data',
            idProperty: 'name',
            autoLoad: true,
            fields: [
                'name',
                'report_id',
                'url',
                'config',
                'type',
                { name: 'recordid', type: 'int' },
                'ts'
            ],
            sortInfo: {
                field: 'ts',
                direction: 'DESC'
            }

        });

        var searchField = new Ext.form.TwinTriggerField({
            xtype: 'twintriggerfield',
            validationEvent: false,
            validateOnBlur: false,
            trigger1Class: 'x-form-clear-trigger',
            trigger2Class: 'x-form-search-trigger',
            hideTrigger1: true,
            enableKeyEvents: true,
            emptyText: 'Filter by name ...',
            store: this.chartReportStore,
            onTrigger1Click: function () {
                this.store.clearFilter();
                this.el.dom.value = '';
                this.triggers[0].hide();
            },
            onTrigger2Click: function () {
                var v = this.getRawValue();
                if (v.length < 1) {
                    this.onTrigger1Click();
                    return;
                }
                this.store.filter('name', v, true, false);
                this.triggers[0].show();
            },
            listeners: {
                scope: this,
                specialkey: function (field, e) {
                    // e.HOME, e.END, e.PAGE_UP, e.PAGE_DOWN,
                    // e.TAB, e.ESC, arrow keys: e.LEFT, e.RIGHT, e.UP, e.DOWN
                    if (e.getKey() === e.ENTER) {
                        searchField.onTrigger2Click();
                    }
                }
            }
        });

        this.chartReportGrid = new Ext.grid.GridPanel({
            store: this.chartReportStore,
            border: false,
            monitorResize: true,
            autoScroll: true,
            viewConfig: {
                forceFit: true
            },
            colModel: new Ext.grid.ColumnModel({
                columns: [
                    { header: 'Name', dataIndex: 'name', width: 250 },
                    { header: 'Type', dataIndex: 'type' },
                    {
                        header: 'Last Modified',
                        dataIndex: 'ts',
                        renderer: function (value) {
                            if (value === '0') {
                                return 'Unknown';
                            }
                            return Ext.util.Format.date(new Date(value * 1000).toString(), 'Y-m-d h:i:s');
                        }
                    }
                ],
                defaults: {
                    sortable: true,
                    menuDisabled: true
                }
            }),
            tbar: {
                items: [
                    searchField,
                    {
                        iconCls: 'refresh',
                        text: 'Refresh',
                        scope: this,
                        handler: function () {
                            searchField.onTrigger1Click();
                            this.chartReportStore.reload();
                        }
                    }
                ]
            },
            selModel: new Ext.grid.RowSelectionModel({
                singleSelect: true,
                listeners: {
                    rowselect: function (selModel, index, r) {
                        selModel.clearSelections();
                        if (r.data.type === 'Chart') {
                            var config = Ext.util.JSON.decode(r.data.config);
                            XDMoD.Module.MetricExplorer.setConfig(config, r.data.name, false);
                        } else if (r.data.type === 'Report') {
                            CCR.xdmod.ui.reportGenerator.fireEvent('load_report', r.data.report_id);
                        }
                    }
                }
            })
        });

        this.height = this.width * aspectRatio;
        this.items = [this.chartReportGrid];

        XDMoD.Module.Dashboard.SavedChartsReportsComponent.superclass.initComponent.apply(this, arguments);
    }
});

/**
* The Ext.reg call is used to register an xtype for this class so it
* can be dynamically instantiated
*/
Ext.reg('xdmod-dash-savedchart-cmp', XDMoD.Module.Dashboard.SavedChartsReportsComponent);
