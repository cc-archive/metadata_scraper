YAHOO.cc.deed.DEED_INFO =  {
    select: [ "work", "attributionName", "attributionURL", "title",
	      "morePermissions", "commercialLicense", "morePermissionsAgent"
	    ],
    where:
    [
	{ pattern: [ "?work", 
		     "http://www.w3.org/1999/xhtml/vocab#license",
		     document.URL ] },

	// optional: Attribution and Work Metadata
	{ where:
	  [
	      { pattern: [ "?work",
			   "http://creativecommons.org/ns#attributionName", 
			   "?attributionName" ], optional: true },
	      { pattern: [ "?work",
			   "http://creativecommons.org/ns#attributionURL", 
			   "?attributionURL" ], optional: true },
	      { pattern: [ "?work",
			   "http://purl.org/dc/elements/1.1/title", 
			   "?title" ], optional: true },
	      { pattern: [ "?work",
			   "http://purl.org/dc/terms/title", 
			   "?title" ], optional: true }
	  ],
	  optional: true
	},

	// optional: CC+
	{ where:
	  [
	      { pattern: [ "?work",
			   "http://creativecommons.org/ns#morePermissions", 
			   "?morePermissions" ], optional: true },
	  ],
	  optional: true
	},
	{ where:
	  [
	      { pattern: [ "?work",
			   "http://creativecommons.org/ns#commercialLicense", 
			   "?commercialLicense" ] },
	      { pattern: [ "?commercialLicense",
			   "http://purl.org/dc/elements/1.1/publisher",
			   "?commercialPublisher" ] },
	      { pattern: [ "?commercialPublisher",
			   "http://purl.org/dc/elements/1.1/title",
			   "?morePermissionsAgent" ] }
	  ],
	  optional: true
	}

	// optional: Registration

	// optionally look for disease information
	]
};

