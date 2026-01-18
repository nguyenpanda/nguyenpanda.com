from PandaHttpd import PandaLogger as _PandaLogger
from typing import Any, Dict


class Logger(_PandaLogger):
    
    def __init__(self, config: Dict[str, Any]):
        self._config = config
        super().__init__(
            logger_name=self._config['name'], 
            file_name=self._config['log_file'], 
            save_dir=self._config['save_dir'], 
            level=self._config['level'],
        )
        
    @property
    def config(self) -> Dict[str, Any]:
    	return self._config
        