const MODULES = { label: 'Modules', icon: 'pi pi-fw pi-home', items:[
  {label:'Admin', icon:'pi pi-fw pi-briefcase', routerLink:['/layout/admin'],activeIgnor:true},
  {label:'Sale', icon:'pi pi-fw pi-briefcase', routerLink:['/layout/sale'],activeIgnor:true},
  {label:'Cash', icon:'pi pi-fw pi-briefcase', routerLink:['/layout/cash'],activeIgnor:true},
  {label:'Client', icon:'pi pi-fw pi-briefcase', routerLink:['/layout/client'],activeIgnor:true},
  {label:'Supply', icon:'pi pi-fw pi-briefcase', routerLink:['/layout/supply'],activeIgnor:true},
  {label:'Reports', icon:'pi pi-fw pi-briefcase', routerLink:['/layout/reports'],activeIgnor:true},
] };
export const MENUITEM = [
  {
    label: 'Home',
    items: [
      { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] },
    ],
  },
  {
    label: 'Modules',
    items: [
      {
        label: 'Sales',
        icon: 'pi pi-fw pi-cart-plus',
        items: [
          {
            label: 'Invoice List',
            icon: 'pi pi-fw pi-list',
          },
          {
            label: 'Sales Report',
            icon: 'pi pi-fw pi-file-pdf',
          },
        ],
      },
      {
        label: 'Supply',
        icon: 'pi pi-fw pi-truck',
        items: [
          {
            label: 'Invoice List',
            icon: 'pi pi-fw pi-list',
          },
          {
            label: 'Supply Report',
            icon: 'pi pi-fw pi-file-pdf',
          },
        ],
      },
      {
        label: 'Clients',
        icon: 'pi pi-fw pi-users',
        items: [
          {
            label: 'Customers',
            icon: 'pi pi-fw pi-list',
          },
          {
            label: 'Suppliers',
            icon: 'pi pi-fw pi-list',
          },
          {
            label: 'Employees',
            icon: 'pi pi-fw pi-list',
          },
          {
            label: 'Loan Clients',
            icon: 'pi pi-fw pi-list',
          },
          {
            label: 'Users',
            icon: 'pi pi-fw pi-users',
          },
        ],
      },
      {
        label: 'Transaction',
        icon: 'pi pi-fw pi-wallet',
        items: [
          {
            label: 'Cash',
            icon: 'pi pi-fw pi-wallet',
          },
          {
            label: 'Expense',
            icon: 'pi pi-fw pi-chart-line',
          },
          {
            label: 'Loan',
            icon: 'pi pi-fw pi-calendar-plus',
          },
        ],
      },
    ],
  },
  {
    label: 'Need Help?',
    items: [
      {
        label: 'FAQ',
        icon: 'pi pi-fw pi-question',
        routerLink: ['/documentation'],
      },
      {
        label: 'Tutorials',
        icon: 'pi pi-fw pi-question',
        routerLink: ['/documentation'],
      },
    ],
  },
];

export const SALEMENUITEM = [
  {
    label: 'Home',
    items: [
      MODULES
    ],
  },
  {
    label: 'Sale Module',
    items: [
      
      {
        label: 'Sale Point',
        icon: 'pi pi-fw pi-shopping-cart',
        routerLink: ['/layout/sale/sale-point'],
      },
      {
        label: 'Invoice List',
        icon: 'pi pi-fw pi-list',
        routerLink: ['/layout/sale/sale-invoice-list'],
      },
      {
        label: 'Customer List',
        icon: 'pi pi-fw pi-list',
        routerLink: ['/layout/sale/customer-list'],
      },
    ]
  },
  {
    label: 'Need Help?',
    items: [
      {
        label: 'FAQ',
        icon: 'pi pi-fw pi-question',
        routerLink: ['/documentation'],
      },
      {
        label: 'Tutorials',
        icon: 'pi pi-fw pi-question',
        routerLink: ['/documentation'],
      },
    ],
  }
];

export const ADMINMENUITEM = [
  {
    label: 'Home',
    items: [
      MODULES,
      { label: 'Dashboard', icon: 'pi pi-fw pi-th-large', routerLink: ['/layout/admin/dashboard'] },
      { label: 'My Task', icon: 'pi pi-fw pi-check-square', routerLink: ['/layout/admin/task-list'] },
      { label: 'Config Setup', icon: 'pi pi-fw pi-cog', routerLink: ['/layout/admin/add-config'] },
    ],
  },
  {
    label: 'Admin Module',
    items: [
      
      {
        label: 'Assets',
        icon: 'pi pi-fw pi-server',
        items:[
          { label: 'Assets', icon: 'pi pi-fw pi-list', routerLink: ['/layout/admin/assets'] },
          { label: 'Add Asset', icon: 'pi pi-fw pi-plus-circle', routerLink: ['/layout/admin/add-asset'] },
        ]
      },
      {
        label: 'Products',
        icon: 'pi pi-fw pi-server',
        items:[
          { label: 'Product Stock', icon: 'pi pi-fw pi-list', routerLink: ['/layout/admin/product-stock'] },
          { label: 'Add Products', icon: 'pi pi-fw pi-plus-circle', routerLink: ['/layout/admin/add-product'] },
        ]
      },
      
      { label: 'Loan Client', icon: 'pi pi-fw pi-plus-circle', routerLink: ['/layout/admin/add-loan-client'] },
      {
        label: 'Employee',
        icon: 'pi pi-fw pi-user',
        items:[
          { label: 'Employee List', icon: 'pi pi-fw pi-list', routerLink: ['/layout/admin/employee-list'] },
          { label: 'Add Employee', icon: 'pi pi-fw pi-plus-circle', routerLink: ['/layout/admin/add-employee'] },
        ]
      },
      {
        label: 'Users',
        icon: 'pi pi-fw pi-user',
        items:[
          { label: 'Add Users', icon: 'pi pi-fw pi-plus-circle', routerLink: ['/layout/admin/add-user'] },
        ]
      },
    ]
  },
  {
    label: 'Need Help?',
    items: [
      {
        label: 'FAQ',
        icon: 'pi pi-fw pi-question',
        routerLink: ['/documentation'],
      },
      {
        label: 'Tutorials',
        icon: 'pi pi-fw pi-question',
        routerLink: ['/documentation'],
      },
    ],
  }
];

export const SUPPLYMENUITEM = [
  {
    label: 'Home',
    items: [
      MODULES
    ],
  },
  {
    label: 'Supply Module',
    items: [
      
      {
        label: 'Issue Supply',
        icon: 'pi pi-fw pi-shopping-cart',
        routerLink: ['/layout/supply/create-supply'],
      },
      {
        label: 'Invoice List',
        icon: 'pi pi-fw pi-list',
        routerLink: ['/layout/supply/supply-invoice-list'],
      },
      {
        label: 'Supplier List',
        icon: 'pi pi-fw pi-user',
        routerLink: ['/layout/supply/supplyer-list'],
      },
      {
        label: 'Product Stock',
        icon: 'pi pi-fw pi-qrcode',
        routerLink: ['/layout/supply/product-stock'],
      },
    ]
  },
  {
    label: 'Need Help?',
    items: [
      {
        label: 'FAQ',
        icon: 'pi pi-fw pi-question',
        routerLink: ['/documentation'],
      },
      {
        label: 'Tutorials',
        icon: 'pi pi-fw pi-question',
        routerLink: ['/documentation'],
      },
    ],
  }
];

export const CLIENTMENUITEM = [
  {
    label: 'Home',
    items: [
      MODULES
    ],
  },
  {
    label: 'Client Module',
    items: [
      {
        label: 'Customer',
        icon: 'pi pi-fw pi-user',
        items:[
          { label: 'Customer List', icon: 'pi pi-fw pi-list', routerLink: ['/layout/client/customer-list'] },
          { label: 'Add Cusomer', icon: 'pi pi-fw pi-plus-circle', routerLink: ['/layout/client/add-customer'] },
        ]
      },
      {
        label: 'Supplier',
        icon: 'pi pi-fw pi-user',
        items:[
          { label: 'Supplier List', icon: 'pi pi-fw pi-list', routerLink: ['/layout/client/supplyer-list'] },
          { label: 'Add Supplier', icon: 'pi pi-fw pi-plus-circle', routerLink: ['/layout/client/add-supplyer'] },
        ]
      },
    ]
  },
  {
    label: 'Need Help?',
    items: [
      {
        label: 'FAQ',
        icon: 'pi pi-fw pi-question',
        routerLink: ['/documentation'],
      },
      {
        label: 'Tutorials',
        icon: 'pi pi-fw pi-question',
        routerLink: ['/documentation'],
      },
    ],
  }
];

export const CASHMENUITEM = [
  {
    label: 'Home',
    items: [
      MODULES
    ],
  },
  {
    label: 'Cash Module',
    items: [
      {
        label: 'Cash Payments',
        icon: 'pi pi-fw pi-wallet',
        routerLink: ['/layout/cash/cash-transaction'],
      },
      {
        label: 'Transactions',
        icon: 'pi pi-fw pi-sort-amount-down',
        routerLink: ['/layout/cash/expenses'],
      },
      {
        label: 'Transaction List',
        icon: 'pi pi-fw pi-list',
        routerLink: ['/layout/cash/transaction-list'],
      },
      {
        label: 'Loan List',
        icon: 'pi pi-fw pi-list',
        routerLink: ['/layout/cash/loan-list'],
      },
    ]
  },
  {
    label: 'Need Help?',
    items: [
      {
        label: 'FAQ',
        icon: 'pi pi-fw pi-question',
        routerLink: ['/documentation'],
      },
      {
        label: 'Tutorials',
        icon: 'pi pi-fw pi-question',
        routerLink: ['/documentation'],
      },
    ],
  }
];


export const REPORTMENUITEM = [
  {
    label: 'Home',
    items: [
      MODULES
    ],
  },
  {
    label: 'Report Module',
    items: [
      {
        label: 'Transaction Report',
        icon: 'pi pi-fw pi-file-pdf',
        routerLink: ['/layout/reports/transaction-report'],
      },
      {
        label: 'Account Report',
        icon: 'pi pi-fw pi-file-pdf',
        routerLink: ['/layout/reports/account-history-report'],
      },
      {
        label: 'Expense Report',
        icon: 'pi pi-fw pi-file-pdf',
        routerLink: ['/layout/reports/expense-report'],
      },
      {
        label: 'Drawing Report',
        icon: 'pi pi-fw pi-file-pdf',
        routerLink: ['/layout/reports/drawing-report'],
      },
      {
        label: 'Loan Report',
        icon: 'pi pi-fw pi-file-pdf',
        routerLink: ['/layout/reports/loan-report'],
      },
      {
        label: 'Stock Sales Report',
        icon: 'pi pi-fw pi-file-pdf',
        routerLink: ['/layout/reports/stock-sale-report'],
      },
      {
        label: 'Stock Supply Report',
        icon: 'pi pi-fw pi-file-pdf',
        routerLink: ['/layout/reports/stock-supply-report'],
      },
      // {
      //   label: 'Sale Report',
      //   icon: 'pi pi-fw pi-file-pdf',
      //   routerLink: ['/layout/reports/sales-report'],
      // },
      {
        label: 'Stock Report',
        icon: 'pi pi-fw pi-file-pdf',
        routerLink: ['/layout/reports/stock-report'],
      },
      {
        label: 'Profit Report',
        icon: 'pi pi-fw pi-file-pdf',
        routerLink: ['/layout/reports/profit-report'],
      },
    ]
  },

  {
    label: 'Need Help?',
    items: [
      {
        label: 'FAQ',
        icon: 'pi pi-fw pi-question',
        routerLink: ['/documentation'],
      },
      {
        label: 'Tutorials',
        icon: 'pi pi-fw pi-question',
        routerLink: ['/documentation'],
      },
    ],
  }
];