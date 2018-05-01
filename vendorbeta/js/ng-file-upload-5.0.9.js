/**!
 * ANGULARJS FILE UPLOAD/DROP DIRECTIVE AND SERVICE WITH PROGRESS AND ABORT
 * @AUTHOR  DANIAL  <DANIAL.FARID@GMAIL.COM>
 * @VERSION 5.0.9
 */

IF (WINDOW.XMLHTTPREQUEST && !(WINDOW.FILEAPI && FILEAPI.SHOULDLOAD)) {
  WINDOW.XMLHTTPREQUEST.PROTOTYPE.SETREQUESTHEADER = (FUNCTION (ORIG) {
    RETURN FUNCTION (HEADER, VALUE) {
      IF (HEADER === '__SETXHR_') {
        VAR VAL = VALUE(THIS);
        // FIX FOR ANGULAR < 1.2.0
        IF (VAL INSTANCEOF FUNCTION) {
          VAL(THIS);
        }
      } ELSE {
        ORIG.APPLY(THIS, ARGUMENTS);
      }
    };
  })(WINDOW.XMLHTTPREQUEST.PROTOTYPE.SETREQUESTHEADER);
}

VAR NGFILEUPLOAD = ANGULAR.MODULE('NGFILEUPLOAD', []);

NGFILEUPLOAD.VERSION = '5.0.9';
NGFILEUPLOAD.SERVICE('UPLOAD', ['$HTTP', '$Q', '$TIMEOUT', FUNCTION ($HTTP, $Q, $TIMEOUT) {
  FUNCTION SENDHTTP(CONFIG) {
    CONFIG.METHOD = CONFIG.METHOD || 'POST';
    CONFIG.HEADERS = CONFIG.HEADERS || {};

    VAR DEFERRED = $Q.DEFER();
    VAR PROMISE = DEFERRED.PROMISE;

    CONFIG.HEADERS.__SETXHR_ = FUNCTION () {
      RETURN FUNCTION (XHR) {
        IF (!XHR) RETURN;
        CONFIG.__XHR = XHR;
        IF (CONFIG.XHRFN) CONFIG.XHRFN(XHR);
        XHR.UPLOAD.ADDEVENTLISTENER('PROGRESS', FUNCTION (E) {
          E.CONFIG = CONFIG;
          IF (DEFERRED.NOTIFY) {
            DEFERRED.NOTIFY(E);
          } ELSE IF (PROMISE.PROGRESSFUNC) {
            $TIMEOUT(FUNCTION () {
              PROMISE.PROGRESSFUNC(E);
            });
          }
        }, FALSE);
        //FIX FOR FIREFOX NOT FIRING UPLOAD PROGRESS END, ALSO IE8-9
        XHR.UPLOAD.ADDEVENTLISTENER('LOAD', FUNCTION (E) {
          IF (E.LENGTHCOMPUTABLE) {
            E.CONFIG = CONFIG;
            IF (DEFERRED.NOTIFY) {
              DEFERRED.NOTIFY(E);
            } ELSE IF (PROMISE.PROGRESSFUNC) {
              $TIMEOUT(FUNCTION () {
                PROMISE.PROGRESSFUNC(E);
              });
            }
          }
        }, FALSE);
      };
    };

    $HTTP(CONFIG).THEN(FUNCTION (R) {
      DEFERRED.RESOLVE(R);
    }, FUNCTION (E) {
      DEFERRED.REJECT(E);
    }, FUNCTION (N) {
      DEFERRED.NOTIFY(N);
    });

    PROMISE.SUCCESS = FUNCTION (FN) {
      PROMISE.THEN(FUNCTION (RESPONSE) {
        FN(RESPONSE.DATA, RESPONSE.STATUS, RESPONSE.HEADERS, CONFIG);
      });
      RETURN PROMISE;
    };

    PROMISE.ERROR = FUNCTION (FN) {
      PROMISE.THEN(NULL, FUNCTION (RESPONSE) {
        FN(RESPONSE.DATA, RESPONSE.STATUS, RESPONSE.HEADERS, CONFIG);
      });
      RETURN PROMISE;
    };

    PROMISE.PROGRESS = FUNCTION (FN) {
      PROMISE.PROGRESSFUNC = FN;
      PROMISE.THEN(NULL, NULL, FUNCTION (UPDATE) {
        FN(UPDATE);
      });
      RETURN PROMISE;
    };
    PROMISE.ABORT = FUNCTION () {
      IF (CONFIG.__XHR) {
        $TIMEOUT(FUNCTION () {
          CONFIG.__XHR.ABORT();
        });
      }
      RETURN PROMISE;
    };
    PROMISE.XHR = FUNCTION (FN) {
      CONFIG.XHRFN = (FUNCTION (ORIGXHRFN) {
        RETURN FUNCTION () {
          IF (ORIGXHRFN) ORIGXHRFN.APPLY(PROMISE, ARGUMENTS);
          FN.APPLY(PROMISE, ARGUMENTS);
        };
      })(CONFIG.XHRFN);
      RETURN PROMISE;
    };

    RETURN PROMISE;
  }

  THIS.UPLOAD = FUNCTION (CONFIG) {
    FUNCTION ADDFIELDTOFORMDATA(FORMDATA, VAL, KEY) {
      IF (VAL !== UNDEFINED) {
        IF (ANGULAR.ISDATE(VAL)) {
          VAL = VAL.TOISOSTRING();
        }
        IF (ANGULAR.ISSTRING(VAL)) {
          FORMDATA.APPEND(KEY, VAL);
        } ELSE IF (CONFIG.SENDFIELDSAS === 'FORM') {
          IF (ANGULAR.ISOBJECT(VAL)) {
            FOR (VAR K IN VAL) {
              IF (VAL.HASOWNPROPERTY(K)) {
                ADDFIELDTOFORMDATA(FORMDATA, VAL[K], KEY + '[' + K + ']');
              }
            }
          } ELSE {
            FORMDATA.APPEND(KEY, VAL);
          }
        } ELSE {
          VAL = ANGULAR.ISSTRING(VAL) ? VAL : JSON.STRINGIFY(VAL);
          IF (CONFIG.SENDFIELDSAS === 'JSON-BLOB') {
            FORMDATA.APPEND(KEY, NEW BLOB([VAL], {TYPE: 'APPLICATION/JSON'}));
          } ELSE {
            FORMDATA.APPEND(KEY, VAL);
          }
        }
      }
    }

    CONFIG.HEADERS = CONFIG.HEADERS || {};
    CONFIG.HEADERS['CONTENT-TYPE'] = UNDEFINED;
    CONFIG.TRANSFORMREQUEST = CONFIG.TRANSFORMREQUEST ?
      (ANGULAR.ISARRAY(CONFIG.TRANSFORMREQUEST) ?
        CONFIG.TRANSFORMREQUEST : [CONFIG.TRANSFORMREQUEST]) : [];
    CONFIG.TRANSFORMREQUEST.PUSH(FUNCTION (DATA) {
      VAR FORMDATA = NEW FORMDATA();
      VAR ALLFIELDS = {};
      VAR KEY;
      FOR (KEY IN CONFIG.FIELDS) {
        IF (CONFIG.FIELDS.HASOWNPROPERTY(KEY)) {
          ALLFIELDS[KEY] = CONFIG.FIELDS[KEY];
        }
      }
      IF (DATA) ALLFIELDS.DATA = DATA;
      FOR (KEY IN ALLFIELDS) {
        IF (ALLFIELDS.HASOWNPROPERTY(KEY)) {
          VAR VAL = ALLFIELDS[KEY];
          IF (CONFIG.FORMDATAAPPENDER) {
            CONFIG.FORMDATAAPPENDER(FORMDATA, KEY, VAL);
          } ELSE {
            ADDFIELDTOFORMDATA(FORMDATA, VAL, KEY);
          }
        }
      }

      IF (CONFIG.FILE != NULL) {
        VAR FILEFORMNAME = CONFIG.FILEFORMDATANAME || 'FILE';

        IF (ANGULAR.ISARRAY(CONFIG.FILE)) {
          VAR ISFILEFORMNAMESTRING = ANGULAR.ISSTRING(FILEFORMNAME);
          FOR (VAR I = 0; I < CONFIG.FILE.LENGTH; I++) {
            FORMDATA.APPEND(ISFILEFORMNAMESTRING ? FILEFORMNAME : FILEFORMNAME[I], CONFIG.FILE[I],
              (CONFIG.FILENAME && CONFIG.FILENAME[I]) || CONFIG.FILE[I].NAME);
          }
        } ELSE {
          FORMDATA.APPEND(FILEFORMNAME, CONFIG.FILE, CONFIG.FILENAME || CONFIG.FILE.NAME);
        }
      }
      RETURN FORMDATA;
    });

    RETURN SENDHTTP(CONFIG);
  };

  THIS.HTTP = FUNCTION (CONFIG) {
    CONFIG.TRANSFORMREQUEST = CONFIG.TRANSFORMREQUEST || FUNCTION (DATA) {
        IF ((WINDOW.ARRAYBUFFER && DATA INSTANCEOF WINDOW.ARRAYBUFFER) || DATA INSTANCEOF BLOB) {
          RETURN DATA;
        }
        RETURN $HTTP.DEFAULTS.TRANSFORMREQUEST[0](ARGUMENTS);
      };
    RETURN SENDHTTP(CONFIG);
  };
}

]);

(FUNCTION () {
    NGFILEUPLOAD.DIRECTIVE('NGFSELECT', ['$PARSE', '$TIMEOUT', '$COMPILE',
        FUNCTION ($PARSE, $TIMEOUT, $COMPILE) {
            RETURN {
                RESTRICT: 'AEC',
                REQUIRE: '?NGMODEL',
                LINK: FUNCTION (SCOPE, ELEM, ATTR, NGMODEL) {
                    LINKFILESELECT(SCOPE, ELEM, ATTR, NGMODEL, $PARSE, $TIMEOUT, $COMPILE);
                }
            };
        }]);

    FUNCTION LINKFILESELECT(SCOPE, ELEM, ATTR, NGMODEL, $PARSE, $TIMEOUT, $COMPILE) {
        /** @NAMESPACE ATTR.NGFSELECT */
        /** @NAMESPACE ATTR.NGFCHANGE */
        /** @NAMESPACE ATTR.NGMODEL */
        /** @NAMESPACE ATTR.NGMODELREJECTED */
        /** @NAMESPACE ATTR.NGFMULTIPLE */
        /** @NAMESPACE ATTR.NGFCAPTURE */
        /** @NAMESPACE ATTR.NGFACCEPT */
        /** @NAMESPACE ATTR.NGFMAXSIZE */
        /** @NAMESPACE ATTR.NGFMINSIZE */
        /** @NAMESPACE ATTR.NGFRESETONCLICK */
        /** @NAMESPACE ATTR.NGFRESETMODELONCLICK */
        /** @NAMESPACE ATTR.NGFKEEP */
        /** @NAMESPACE ATTR.NGFKEEPDISTINCT */

        IF (ELEM.ATTR('__NGF_GEN__')) {
            RETURN;
        }

        SCOPE.$ON('$DESTROY', FUNCTION () {
            IF (ELEM.$$NGFREFELEM) ELEM.$$NGFREFELEM.REMOVE();
        });

        VAR DISABLED = FALSE;
        IF (ATTR.NGFSELECT.SEARCH(/\W+$FILES\W+/) === -1) {
            SCOPE.$WATCH(ATTR.NGFSELECT, FUNCTION (VAL) {
                DISABLED = VAL === FALSE;
            });
        }
        FUNCTION ISINPUTTYPEFILE() {
            RETURN ELEM[0].TAGNAME.TOLOWERCASE() === 'INPUT' && ATTR.TYPE && ATTR.TYPE.TOLOWERCASE() === 'FILE';
        }

        VAR ISUPDATING = FALSE;

        FUNCTION CHANGEFN(EVT) {
            IF (!ISUPDATING) {
                ISUPDATING = TRUE;
                TRY {
                    VAR FILELIST = EVT.__FILES_ || (EVT.TARGET && EVT.TARGET.FILES);
                    VAR FILES = [], REJFILES = [];

                    FOR (VAR I = 0; I < FILELIST.LENGTH; I++) {
                        VAR FILE = FILELIST.ITEM(I);
                        IF (VALIDATE(SCOPE, $PARSE, ATTR, FILE, EVT)) {
                            FILES.PUSH(FILE);
                        } ELSE {
                            REJFILES.PUSH(FILE);
                        }
                    }
                    UPDATEMODEL($PARSE, $TIMEOUT, SCOPE, NGMODEL, ATTR, ATTR.NGFCHANGE || ATTR.NGFSELECT, FILES, REJFILES, EVT);
                    IF (FILES.LENGTH === 0) EVT.TARGET.VALUE = FILES;
//                IF (EVT.TARGET && EVT.TARGET.GETATTRIBUTE('__NGF_GEN__')) {
//                    ANGULAR.ELEMENT(EVT.TARGET).REMOVE();
//                }
                } FINALLY {
                    ISUPDATING = FALSE;
                }
            }
        }

        FUNCTION BINDATTRTOFILEINPUT(FILEELEM) {
            IF (ATTR.NGFMULTIPLE) FILEELEM.ATTR('MULTIPLE', $PARSE(ATTR.NGFMULTIPLE)(SCOPE));
            IF (ATTR.NGFCAPTURE) FILEELEM.ATTR('CAPTURE', $PARSE(ATTR.NGFCAPTURE)(SCOPE));
            IF (ATTR.ACCEPT) FILEELEM.ATTR('ACCEPT', ATTR.ACCEPT);
            FOR (VAR I = 0; I < ELEM[0].ATTRIBUTES.LENGTH; I++) {
                VAR ATTRIBUTE = ELEM[0].ATTRIBUTES[I];
                IF ((ISINPUTTYPEFILE() && ATTRIBUTE.NAME !== 'TYPE') ||
                    (ATTRIBUTE.NAME !== 'TYPE' && ATTRIBUTE.NAME !== 'CLASS' &&
                    ATTRIBUTE.NAME !== 'ID' && ATTRIBUTE.NAME !== 'STYLE')) {
                    FILEELEM.ATTR(ATTRIBUTE.NAME, ATTRIBUTE.VALUE);
                }
            }
        }

        FUNCTION CREATEFILEINPUT(EVT, RESETONCLICK) {
            IF (!RESETONCLICK && (EVT || ISINPUTTYPEFILE())) RETURN ELEM.$$NGFREFELEM || ELEM;

            VAR FILEELEM = ANGULAR.ELEMENT('<INPUT TYPE="FILE">');
            BINDATTRTOFILEINPUT(FILEELEM);

            IF (ISINPUTTYPEFILE()) {
                ELEM.REPLACEWITH(FILEELEM);
                ELEM = FILEELEM;
                FILEELEM.ATTR('__NGF_GEN__', TRUE);
                $COMPILE(ELEM)(SCOPE);
            } ELSE {
                FILEELEM.CSS('VISIBILITY', 'HIDDEN').CSS('POSITION', 'ABSOLUTE').CSS('OVERFLOW', 'HIDDEN')
                    .CSS('WIDTH', '0PX').CSS('HEIGHT', '0PX').CSS('Z-INDEX', '-100000').CSS('BORDER', 'NONE')
                    .CSS('MARGIN', '0PX').CSS('PADDING', '0PX').ATTR('TABINDEX', '-1');
                IF (ELEM.$$NGFREFELEM) {
                    ELEM.$$NGFREFELEM.REMOVE();
                }
                ELEM.$$NGFREFELEM = FILEELEM;
                DOCUMENT.BODY.APPENDCHILD(FILEELEM[0]);
            }

            RETURN FILEELEM;
        }

        FUNCTION RESETMODEL(EVT) {
            UPDATEMODEL($PARSE, $TIMEOUT, SCOPE, NGMODEL, ATTR, ATTR.NGFCHANGE || ATTR.NGFSELECT, [], [], EVT, TRUE);
        }

        FUNCTION CLICKHANDLER(EVT) {
            IF (ELEM.ATTR('DISABLED') || DISABLED) RETURN FALSE;
            IF (EVT != NULL) {
                EVT.PREVENTDEFAULT();
                EVT.STOPPROPAGATION();
            }
            VAR RESETONCLICK = $PARSE(ATTR.NGFRESETONCLICK)(SCOPE) !== FALSE;
            VAR FILEELEM = CREATEFILEINPUT(EVT, RESETONCLICK);

            FUNCTION CLICKANDASSIGN(EVT) {
                IF (EVT) {
                    FILEELEM[0].CLICK();
                }
                IF (ISINPUTTYPEFILE() || !EVT) {
                    ELEM.BIND('CLICK TOUCHEND', CLICKHANDLER);
                }
            }

            IF (FILEELEM) {
                IF (!EVT || RESETONCLICK) FILEELEM.BIND('CHANGE', CHANGEFN);
                IF (EVT && RESETONCLICK && $PARSE(ATTR.NGFRESETMODELONCLICK)(SCOPE) !== FALSE) RESETMODEL(EVT);

                // FIX FOR ANDROID NATIVE BROWSER < 4.4
                IF (SHOULDCLICKLATER(NAVIGATOR.USERAGENT)) {
                    SETTIMEOUT(FUNCTION () {
                        CLICKANDASSIGN(EVT);
                    }, 0);
                } ELSE {
                    CLICKANDASSIGN(EVT);
                }
            }
            RETURN FALSE;
        }

        IF (WINDOW.FILEAPI && WINDOW.FILEAPI.NGFFIXIE) {
            WINDOW.FILEAPI.NGFFIXIE(ELEM, CREATEFILEINPUT, BINDATTRTOFILEINPUT, CHANGEFN);
        } ELSE {
            CLICKHANDLER();
            //IF (!ISINPUTTYPEFILE()) {
            //  ELEM.BIND('CLICK TOUCHEND', CLICKHANDLER);
            //}
        }
    }

    FUNCTION SHOULDCLICKLATER(UA) {
        // ANDROID BELOW 4.4
        VAR M = UA.MATCH(/ANDROID[^\D]*(\D+)\.(\D+)/);
        IF (M && M.LENGTH > 2) {
            RETURN PARSEINT(M[1]) < 4 || (PARSEINT(M[1]) === 4 && PARSEINT(M[2]) < 4);
        }

        // SAFARI ON WINDOWS
        RETURN /.*WINDOWS.*SAFARI.*/.TEST(UA);
    }

    NGFILEUPLOAD.VALIDATE = FUNCTION (SCOPE, $PARSE, ATTR, FILE, EVT) {
        FUNCTION GLOBSTRINGTOREGEX(STR) {
            IF (STR.LENGTH > 2 && STR[0] === '/' && STR[STR.LENGTH - 1] === '/') {
                RETURN STR.SUBSTRING(1, STR.LENGTH - 1);
            }
            VAR SPLIT = STR.SPLIT(','), RESULT = '';
            IF (SPLIT.LENGTH > 1) {
                FOR (VAR I = 0; I < SPLIT.LENGTH; I++) {
                    RESULT += '(' + GLOBSTRINGTOREGEX(SPLIT[I]) + ')';
                    IF (I < SPLIT.LENGTH - 1) {
                        RESULT += '|';
                    }
                }
            } ELSE {
                IF (STR.INDEXOF('.') === 0) {
                    STR = '*' + STR;
                }
                RESULT = '^' + STR.REPLACE(NEW REGEXP('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + '-]', 'G'), '\\$&') + '$';
                RESULT = RESULT.REPLACE(/\\\*/G, '.*').REPLACE(/\\\?/G, '.');
            }
            RETURN RESULT;
        }

        VAR ACCEPT = $PARSE(ATTR.NGFACCEPT)(SCOPE, {$FILE: FILE, $EVENT: EVT});
        VAR FILESIZEMAX = $PARSE(ATTR.NGFMAXSIZE)(SCOPE, {$FILE: FILE, $EVENT: EVT}) || 9007199254740991;
        VAR FILESIZEMIN = $PARSE(ATTR.NGFMINSIZE)(SCOPE, {$FILE: FILE, $EVENT: EVT}) || -1;
        IF (ACCEPT != NULL && ANGULAR.ISSTRING(ACCEPT)) {
            VAR REGEXP = NEW REGEXP(GLOBSTRINGTOREGEX(ACCEPT), 'GI');
            ACCEPT = (FILE.TYPE != NULL && REGEXP.TEST(FILE.TYPE.TOLOWERCASE())) ||
                (FILE.NAME != NULL && REGEXP.TEST(FILE.NAME.TOLOWERCASE()));
        }
        RETURN (ACCEPT == NULL || ACCEPT) && (FILE.SIZE == NULL || (FILE.SIZE < FILESIZEMAX && FILE.SIZE > FILESIZEMIN));
    };

    NGFILEUPLOAD.UPDATEMODEL = FUNCTION ($PARSE, $TIMEOUT, SCOPE, NGMODEL, ATTR, FILECHANGE,
                                         FILES, REJFILES, EVT, NODELAY) {
        FUNCTION UPDATE() {
            IF ($PARSE(ATTR.NGFKEEP)(SCOPE) === TRUE) {
                VAR PREVFILES = (NGMODEL.$MODELVALUE || []).SLICE(0);
                IF (!FILES || !FILES.LENGTH) {
                    FILES = PREVFILES;
                } ELSE IF ($PARSE(ATTR.NGFKEEPDISTINCT)(SCOPE) === TRUE) {
                    VAR LEN = PREVFILES.LENGTH;
                    FOR (VAR I = 0; I < FILES.LENGTH; I++) {
                        FOR (VAR J = 0; J < LEN; J++) {
                            IF (FILES[I].NAME === PREVFILES[J].NAME) BREAK;
                        }
                        IF (J === LEN) {
                            PREVFILES.PUSH(FILES[I]);
                        }
                    }
                    FILES = PREVFILES;
                } ELSE {
                    FILES = PREVFILES.CONCAT(FILES);
                }
            }
            IF (NGMODEL) {
                $PARSE(ATTR.NGMODEL).ASSIGN(SCOPE, FILES);
                $TIMEOUT(FUNCTION () {
                    IF (NGMODEL) {
                        NGMODEL.$SETVIEWVALUE(FILES != NULL && FILES.LENGTH === 0 ? NULL : FILES);
                    }
                });
            }
            IF (ATTR.NGMODELREJECTED) {
                $PARSE(ATTR.NGMODELREJECTED).ASSIGN(SCOPE, REJFILES);
            }
            IF (FILECHANGE) {
                $PARSE(FILECHANGE)(SCOPE, {
                    $FILES: FILES,
                    $REJECTEDFILES: REJFILES,
                    $EVENT: EVT
                });
            }
        }

        IF (NODELAY) {
            UPDATE();
        } ELSE {
            $TIMEOUT(FUNCTION () {
                UPDATE();
            });
        }
    };

    VAR VALIDATE = NGFILEUPLOAD.VALIDATE;
    VAR UPDATEMODEL = NGFILEUPLOAD.UPDATEMODEL;

})();

(FUNCTION () {
  VAR VALIDATE = NGFILEUPLOAD.VALIDATE;
  VAR UPDATEMODEL = NGFILEUPLOAD.UPDATEMODEL;

  NGFILEUPLOAD.DIRECTIVE('NGFDROP', ['$PARSE', '$TIMEOUT', '$LOCATION', FUNCTION ($PARSE, $TIMEOUT, $LOCATION) {
    RETURN {
      RESTRICT: 'AEC',
      REQUIRE: '?NGMODEL',
      LINK: FUNCTION (SCOPE, ELEM, ATTR, NGMODEL) {
        LINKDROP(SCOPE, ELEM, ATTR, NGMODEL, $PARSE, $TIMEOUT, $LOCATION);
      }
    };
  }]);

  NGFILEUPLOAD.DIRECTIVE('NGFNOFILEDROP', FUNCTION () {
    RETURN FUNCTION (SCOPE, ELEM) {
      IF (DROPAVAILABLE()) ELEM.CSS('DISPLAY', 'NONE');
    };
  });

  NGFILEUPLOAD.DIRECTIVE('NGFDROPAVAILABLE', ['$PARSE', '$TIMEOUT', FUNCTION ($PARSE, $TIMEOUT) {
    RETURN FUNCTION (SCOPE, ELEM, ATTR) {
      IF (DROPAVAILABLE()) {
        VAR FN = $PARSE(ATTR.NGFDROPAVAILABLE);
        $TIMEOUT(FUNCTION () {
          FN(SCOPE);
          IF (FN.ASSIGN) {
            FN.ASSIGN(SCOPE, TRUE);
          }
        });
      }
    };
  }]);

  FUNCTION LINKDROP(SCOPE, ELEM, ATTR, NGMODEL, $PARSE, $TIMEOUT, $LOCATION) {
    VAR AVAILABLE = DROPAVAILABLE();
    IF (ATTR.DROPAVAILABLE) {
      $TIMEOUT(FUNCTION () {
        IF (SCOPE[ATTR.DROPAVAILABLE]) {
          SCOPE[ATTR.DROPAVAILABLE].VALUE = AVAILABLE;
        } ELSE {
          SCOPE[ATTR.DROPAVAILABLE] = AVAILABLE;
        }
      });
    }
    IF (!AVAILABLE) {
      IF ($PARSE(ATTR.NGFHIDEONDROPNOTAVAILABLE)(SCOPE) === TRUE) {
        ELEM.CSS('DISPLAY', 'NONE');
      }
      RETURN;
    }

    VAR DISABLED = FALSE;
    IF (ATTR.NGFDROP.SEARCH(/\W+$FILES\W+/) === -1) {
      SCOPE.$WATCH(ATTR.NGFDROP, FUNCTION(VAL) {
        DISABLED = VAL === FALSE;
      });
    }

    VAR LEAVETIMEOUT = NULL;
    VAR STOPPROPAGATION = $PARSE(ATTR.NGFSTOPPROPAGATION);
    VAR DRAGOVERDELAY = 1;
    VAR ACTUALDRAGOVERCLASS;

    ELEM[0].ADDEVENTLISTENER('DRAGOVER', FUNCTION (EVT) {
      IF (ELEM.ATTR('DISABLED') || DISABLED) RETURN;
      EVT.PREVENTDEFAULT();
      IF (STOPPROPAGATION(SCOPE)) EVT.STOPPROPAGATION();
      // HANDLING DRAGOVER EVENTS FROM THE CHROME DOWNLOAD BAR
      IF (NAVIGATOR.USERAGENT.INDEXOF('CHROME') > -1) {
        VAR B = EVT.DATATRANSFER.EFFECTALLOWED;
        EVT.DATATRANSFER.DROPEFFECT = ('MOVE' === B || 'LINKMOVE' === B) ? 'MOVE' : 'COPY';
      }
      $TIMEOUT.CANCEL(LEAVETIMEOUT);
      IF (!SCOPE.ACTUALDRAGOVERCLASS) {
        ACTUALDRAGOVERCLASS = CALCULATEDRAGOVERCLASS(SCOPE, ATTR, EVT);
      }
      ELEM.ADDCLASS(ACTUALDRAGOVERCLASS);
    }, FALSE);
    ELEM[0].ADDEVENTLISTENER('DRAGENTER', FUNCTION (EVT) {
      IF (ELEM.ATTR('DISABLED') || DISABLED) RETURN;
      EVT.PREVENTDEFAULT();
      IF (STOPPROPAGATION(SCOPE)) EVT.STOPPROPAGATION();
    }, FALSE);
    ELEM[0].ADDEVENTLISTENER('DRAGLEAVE', FUNCTION () {
      IF (ELEM.ATTR('DISABLED') || DISABLED) RETURN;
      LEAVETIMEOUT = $TIMEOUT(FUNCTION () {
        ELEM.REMOVECLASS(ACTUALDRAGOVERCLASS);
        ACTUALDRAGOVERCLASS = NULL;
      }, DRAGOVERDELAY || 1);
    }, FALSE);
    ELEM[0].ADDEVENTLISTENER('DROP', FUNCTION (EVT) {
      IF (ELEM.ATTR('DISABLED') || DISABLED) RETURN;
      EVT.PREVENTDEFAULT();
      IF (STOPPROPAGATION(SCOPE)) EVT.STOPPROPAGATION();
      ELEM.REMOVECLASS(ACTUALDRAGOVERCLASS);
      ACTUALDRAGOVERCLASS = NULL;
      EXTRACTFILES(EVT, FUNCTION (FILES, REJFILES) {
        UPDATEMODEL($PARSE, $TIMEOUT, SCOPE, NGMODEL, ATTR,
          ATTR.NGFCHANGE || ATTR.NGFDROP, FILES, REJFILES, EVT);
      }, $PARSE(ATTR.NGFALLOWDIR)(SCOPE) !== FALSE, ATTR.MULTIPLE || $PARSE(ATTR.NGFMULTIPLE)(SCOPE));
    }, FALSE);

    FUNCTION CALCULATEDRAGOVERCLASS(SCOPE, ATTR, EVT) {
      VAR ACCEPTED = TRUE;
      VAR ITEMS = EVT.DATATRANSFER.ITEMS;
      IF (ITEMS != NULL) {
        FOR (VAR I = 0; I < ITEMS.LENGTH && ACCEPTED; I++) {
          ACCEPTED = ACCEPTED &&
            (ITEMS[I].KIND === 'FILE' || ITEMS[I].KIND === '') &&
            VALIDATE(SCOPE, $PARSE, ATTR, ITEMS[I], EVT);
        }
      }
      VAR CLAZZ = $PARSE(ATTR.NGFDRAGOVERCLASS)(SCOPE, {$EVENT: EVT});
      IF (CLAZZ) {
        IF (CLAZZ.DELAY) DRAGOVERDELAY = CLAZZ.DELAY;
        IF (CLAZZ.ACCEPT) CLAZZ = ACCEPTED ? CLAZZ.ACCEPT : CLAZZ.REJECT;
      }
      RETURN CLAZZ || ATTR.NGFDRAGOVERCLASS || 'DRAGOVER';
    }

    FUNCTION EXTRACTFILES(EVT, CALLBACK, ALLOWDIR, MULTIPLE) {
      VAR FILES = [], REJFILES = [], ITEMS = EVT.DATATRANSFER.ITEMS, PROCESSING = 0;

      FUNCTION ADDFILE(FILE) {
        IF (VALIDATE(SCOPE, $PARSE, ATTR, FILE, EVT)) {
          FILES.PUSH(FILE);
        } ELSE {
          REJFILES.PUSH(FILE);
        }
      }

      FUNCTION TRAVERSEFILETREE(FILES, ENTRY, PATH) {
        IF (ENTRY != NULL) {
          IF (ENTRY.ISDIRECTORY) {
            VAR FILEPATH = (PATH || '') + ENTRY.NAME;
            ADDFILE({NAME: ENTRY.NAME, TYPE: 'DIRECTORY', PATH: FILEPATH});
            VAR DIRREADER = ENTRY.CREATEREADER();
            VAR ENTRIES = [];
            PROCESSING++;
            VAR READENTRIES = FUNCTION () {
              DIRREADER.READENTRIES(FUNCTION (RESULTS) {
                TRY {
                  IF (!RESULTS.LENGTH) {
                    FOR (VAR I = 0; I < ENTRIES.LENGTH; I++) {
                      TRAVERSEFILETREE(FILES, ENTRIES[I], (PATH ? PATH : '') + ENTRY.NAME + '/');
                    }
                    PROCESSING--;
                  } ELSE {
                    ENTRIES = ENTRIES.CONCAT(ARRAY.PROTOTYPE.SLICE.CALL(RESULTS || [], 0));
                    READENTRIES();
                  }
                } CATCH (E) {
                  PROCESSING--;
                  CONSOLE.ERROR(E);
                }
              }, FUNCTION () {
                PROCESSING--;
              });
            };
            READENTRIES();
          } ELSE {
            PROCESSING++;
            ENTRY.FILE(FUNCTION (FILE) {
              TRY {
                PROCESSING--;
                FILE.PATH = (PATH ? PATH : '') + FILE.NAME;
                ADDFILE(FILE);
              } CATCH (E) {
                PROCESSING--;
                CONSOLE.ERROR(E);
              }
            }, FUNCTION () {
              PROCESSING--;
            });
          }
        }
      }

      IF (ITEMS && ITEMS.LENGTH > 0 && $LOCATION.PROTOCOL() !== 'FILE') {
        FOR (VAR I = 0; I < ITEMS.LENGTH; I++) {
          IF (ITEMS[I].WEBKITGETASENTRY && ITEMS[I].WEBKITGETASENTRY() && ITEMS[I].WEBKITGETASENTRY().ISDIRECTORY) {
            VAR ENTRY = ITEMS[I].WEBKITGETASENTRY();
            IF (ENTRY.ISDIRECTORY && !ALLOWDIR) {
              CONTINUE;
            }
            IF (ENTRY != NULL) {
              TRAVERSEFILETREE(FILES, ENTRY);
            }
          } ELSE {
            VAR F = ITEMS[I].GETASFILE();
            IF (F != NULL) ADDFILE(F);
          }
          IF (!MULTIPLE && FILES.LENGTH > 0) BREAK;
        }
      } ELSE {
        VAR FILELIST = EVT.DATATRANSFER.FILES;
        IF (FILELIST != NULL) {
          FOR (VAR J = 0; J < FILELIST.LENGTH; J++) {
            ADDFILE(FILELIST.ITEM(J));
            IF (!MULTIPLE && FILES.LENGTH > 0) {
              BREAK;
            }
          }
        }
      }
      VAR DELAYS = 0;
      (FUNCTION WAITFORPROCESS(DELAY) {
        $TIMEOUT(FUNCTION () {
          IF (!PROCESSING) {
            IF (!MULTIPLE && FILES.LENGTH > 1) {
              I = 0;
              WHILE (FILES[I].TYPE === 'DIRECTORY') I++;
              FILES = [FILES[I]];
            }
            CALLBACK(FILES, REJFILES);
          } ELSE {
            IF (DELAYS++ * 10 < 20 * 1000) {
              WAITFORPROCESS(10);
            }
          }
        }, DELAY || 0);
      })();
    }
  }

  NGFILEUPLOAD.DIRECTIVE('NGFSRC', ['$PARSE', '$TIMEOUT', FUNCTION ($PARSE, $TIMEOUT) {
    RETURN {
      RESTRICT: 'AE',
      LINK: FUNCTION (SCOPE, ELEM, ATTR) {
        IF (WINDOW.FILEREADER) {
          SCOPE.$WATCH(ATTR.NGFSRC, FUNCTION (FILE) {
            IF (FILE &&
              VALIDATE(SCOPE, $PARSE, ATTR, FILE, NULL) &&
              (!WINDOW.FILEAPI || NAVIGATOR.USERAGENT.INDEXOF('MSIE 8') === -1 || FILE.SIZE < 20000) &&
              (!WINDOW.FILEAPI || NAVIGATOR.USERAGENT.INDEXOF('MSIE 9') === -1 || FILE.SIZE < 4000000)) {
              $TIMEOUT(FUNCTION () {
                //PREFER URL.CREATEOBJECTURL FOR HANDLING REFRENCES TO FILES OF ALL SIZES
                //SINCE IT DOESN´T BUILD A LARGE STRING IN MEMORY
                VAR URL = WINDOW.URL || WINDOW.WEBKITURL;
                IF (URL && URL.CREATEOBJECTURL) {
                  ELEM.ATTR('SRC', URL.CREATEOBJECTURL(FILE));
                } ELSE {
                  VAR FILEREADER = NEW FILEREADER();
                  FILEREADER.READASDATAURL(FILE);
                  FILEREADER.ONLOAD = FUNCTION (E) {
                    $TIMEOUT(FUNCTION () {
                      ELEM.ATTR('SRC', E.TARGET.RESULT);
                    });
                  };
                }
              });
            } ELSE {
              ELEM.ATTR('SRC', ATTR.NGFDEFAULTSRC || '');
            }
          });
        }
      }
    };
  }]);

  FUNCTION DROPAVAILABLE() {
    VAR DIV = DOCUMENT.CREATEELEMENT('DIV');
    RETURN ('DRAGGABLE' IN DIV) && ('ONDROP' IN DIV);
  }

})();