declare function require(s: string): void;

require("./specs/appstorageasync.spec");
require("./specs/AsyncActionTracker.spec");
require("./specs/byte.spec");
require("./specs/collections.map.spec");
require("./specs/color.spec");
require("./specs/convert.spec");
require("./specs/system.spec");

jasmine.getEnv().execute();
