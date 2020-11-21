import React from 'react';
import useModalState from '../modals/useModalState';
import ConnectionModal from '../modals/ConnectionModal';
import styled from 'styled-components';
import ToolbarButton from './ToolbarButton';
import useNewQuery from '../query/useNewQuery';
import { useConfig } from '../utility/metadataLoaders';
import { useSetOpenedTabs, useOpenedTabs, useCurrentTheme, useSetCurrentTheme } from '../utility/globalState';
import { openNewTab } from '../utility/common';
import useNewFreeTable from '../freetable/useNewFreeTable';
import ImportExportModal from '../modals/ImportExportModal';
import useShowModal from '../modals/showModal';
import useExtensions from '../utility/useExtensions';
import { getDefaultFileFormat } from '../utility/fileformats';

const ToolbarContainer = styled.div`
  display: flex;
  user-select: none;
`;

export default function ToolBar({ toolbarPortalRef }) {
  const modalState = useModalState();
  const newQuery = useNewQuery();
  const newFreeTable = useNewFreeTable();
  const config = useConfig();
  const toolbar = config.toolbar || [];
  const setOpenedTabs = useSetOpenedTabs();
  const openedTabs = useOpenedTabs();
  const showModal = useShowModal();
  const currentTheme = useCurrentTheme();
  const setCurrentTheme = useSetCurrentTheme();
  const extensions = useExtensions();

  React.useEffect(() => {
    window['dbgate_createNewConnection'] = modalState.open;
    window['dbgate_newQuery'] = newQuery;
    window['dbgate_closeAll'] = () => setOpenedTabs([]);
  });

  const showImport = () => {
    showModal((modalState) => (
      <ImportExportModal
        modalState={modalState}
        importToArchive
        initialValues={{
          sourceStorageType: getDefaultFileFormat(extensions).storageType,
          // sourceConnectionId: data.conid,
          // sourceDatabaseName: data.database,
          // sourceSchemaName: data.schemaName,
          // sourceList: [data.pureName],
        }}
      />
    ));
  };

  const switchTheme = () => {
    if (currentTheme == 'light') setCurrentTheme('dark');
    else setCurrentTheme('light');
  };

  function openTabFromButton(button) {
    if (openedTabs.find((x) => x.tabComponent == 'InfoPageTab' && x.props && x.props.page == button.page)) {
      setOpenedTabs((tabs) =>
        tabs.map((tab) => ({
          ...tab,
          selected: tab.tabComponent == 'InfoPageTab' && tab.props && tab.props.page == button.page,
          closedTime: undefined,
        }))
      );
    } else {
      openNewTab(setOpenedTabs, {
        title: button.title,
        tabComponent: 'InfoPageTab',
        icon: button.icon,
        props: {
          page: button.page,
        },
      });
    }
  }

  React.useEffect(() => {
    if (config.startupPages) {
      for (const page of config.startupPages) {
        const button = toolbar.find((x) => x.name == page);
        if (button) {
          openTabFromButton(button);
        }
      }
    }
  }, config && config.startupPages);

  return (
    <ToolbarContainer>
      <ConnectionModal modalState={modalState} />
      {toolbar.map((button) => (
        <ToolbarButton key={button.name} onClick={() => openTabFromButton(button)} icon={button.icon}>
          {button.title}
        </ToolbarButton>
      ))}
      {config.runAsPortal == false && (
        <ToolbarButton onClick={modalState.open} icon="icon new-connection">
          Add connection
        </ToolbarButton>
      )}
      <ToolbarButton onClick={newQuery} icon="icon sql-file">
        New Query
      </ToolbarButton>
      <ToolbarButton onClick={newFreeTable} icon="icon table">
        Free table editor
      </ToolbarButton>
      <ToolbarButton onClick={showImport} icon="icon import">
        Import data
      </ToolbarButton>
      <ToolbarButton onClick={switchTheme} icon="icon theme">
        {currentTheme == 'dark' ? 'Light mode' : 'Dark mode'}
      </ToolbarButton>

      <ToolbarContainer ref={toolbarPortalRef}></ToolbarContainer>
    </ToolbarContainer>
  );
}
